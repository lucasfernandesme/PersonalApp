import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("Sem assinatura", { status: 400 });
    }

    try {
        const body = await req.text();
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
        );

        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const customerId = subscription.customer as string;
                const status = subscription.status;
                const priceId = subscription.items.data[0].price.id;
                const endDate = new Date(subscription.current_period_end * 1000).toISOString();

                await supabaseAdmin
                    .from("trainers")
                    .update({
                        subscription_status: status,
                        subscription_price_id: priceId,
                        subscription_end_date: endDate,
                    })
                    .eq("stripe_customer_id", customerId);
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const customerId = subscription.customer as string;

                await supabaseAdmin
                    .from("trainers")
                    .update({
                        subscription_status: "canceled",
                        subscription_end_date: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        console.error(`Erro no Webhook: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
