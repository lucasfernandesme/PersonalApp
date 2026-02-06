import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.16.0?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

console.log("[DEBUG] Webhook function started (v11 - METADATA MAPPING + FALLBACK)");

Deno.serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    try {
        const body = await req.text();
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        let event;

        // 1. Try Standard Verification
        if (signature && webhookSecret) {
            try {
                event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    webhookSecret,
                    undefined,
                    cryptoProvider
                );
            } catch (err) {
                console.error(`[DEBUG] Verify failed: ${err.message}. Trying Fallback...`);
            }
        }

        // 2. Fallback Fetch
        if (!event) {
            try {
                const rawJson = JSON.parse(body);
                if (rawJson?.id) {
                    // console.log(`[DEBUG] Fetching event ${rawJson.id}...`);
                    event = await stripe.events.retrieve(rawJson.id);
                }
            } catch (err) {
                console.error(`[DEBUG] Fallback failed: ${err.message}`);
                return new Response(`Webhook Critical Error: ${err.message}`, { status: 400 });
            }
        }

        if (!event) {
            return new Response("Invalid Payload", { status: 400 });
        }

        // 3. Process Event with ROBUST MAPPING
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const status = subscription.status;
                const priceId = subscription.items.data[0].price.id;
                const endDate = new Date(subscription.current_period_end * 1000).toISOString();

                // STRATEGY A: Metadata (Preferred)
                // When we create the subscription via checkout, we put metadata on the subscription_data
                const supabaseId = subscription.metadata?.supabase_id;

                if (supabaseId) {
                    console.log(`[DEBUG] Updating via Metadata ID: ${supabaseId}`);
                    await supabaseAdmin.from("trainers").update({
                        subscription_status: status,
                        subscription_price_id: priceId,
                        subscription_end_date: endDate,
                    }).eq("id", supabaseId);
                } else {
                    // STRATEGY B: Customer ID (Legacy/Fallback)
                    const customerId = subscription.customer as string;
                    console.log(`[DEBUG] Updating via Customer ID: ${customerId}`);
                    await supabaseAdmin.from("trainers").update({
                        subscription_status: status,
                        subscription_price_id: priceId,
                        subscription_end_date: endDate,
                    }).eq("stripe_customer_id", customerId);
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const supabaseId = subscription.metadata?.supabase_id;
                const customerId = subscription.customer as string;

                const updateData = {
                    subscription_status: "canceled",
                    subscription_end_date: new Date().toISOString(),
                };

                if (supabaseId) {
                    await supabaseAdmin.from("trainers").update(updateData).eq("id", supabaseId);
                } else {
                    await supabaseAdmin.from("trainers").update(updateData).eq("stripe_customer_id", customerId);
                }
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error(`[CRITICAL] Global Error: ${err.message}`);
        return new Response(`Global Error: ${err.message}`, { status: 500 });
    }
});
