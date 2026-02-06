import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.16.0?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader || "" } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) throw new Error("Não autorizado");

        // Procura se já existe um customer ID para este trainer
        const { data: profile } = await supabaseClient
            .from("trainers")
            .select("stripe_customer_id, name")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.name || user.email,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;

            await supabaseClient
                .from("trainers")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        const { priceId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${req.headers.get("origin")}/?payment=success`,
            cancel_url: `${req.headers.get("origin")}/?payment=cancel`,
            subscription_data: {
                metadata: {
                    supabase_id: user.id // CRITICAL: This allows robust mapping in webhook
                }
            }
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
