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
        // 1. Authenticate User
        const authHeader = req.headers.get("Authorization");
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader || "" } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // 2. Admin Client for DB Updates
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 3. Get Trainer Info
        const { data: trainer } = await supabaseAdmin
            .from("trainers")
            .select("stripe_customer_id, subscription_status")
            .eq("id", user.id)
            .single();

        if (!trainer?.stripe_customer_id) {
            return new Response(JSON.stringify({ status: "no_customer_id" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Check Stripe directly
        const customer = await stripe.customers.retrieve(trainer.stripe_customer_id, {
            expand: ["subscriptions"],
        });

        if (customer.deleted) throw new Error("Customer deleted in Stripe");

        const activeSub = customer.subscriptions?.data.find(s =>
            s.status === "active" || s.status === "trialing"
        );

        if (activeSub) {
            // Found active sub in Stripe! Update DB.
            const priceId = activeSub.items.data[0].price.id;
            const endDate = new Date(activeSub.current_period_end * 1000).toISOString();

            await supabaseAdmin
                .from("trainers")
                .update({
                    subscription_status: activeSub.status,
                    subscription_price_id: priceId,
                    subscription_end_date: endDate,
                })
                .eq("id", user.id); // Update by ID safe now

            return new Response(JSON.stringify({
                success: true,
                status: activeSub.status,
                fixed: true
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } else {
            return new Response(JSON.stringify({
                success: true,
                status: "inactive",
                fixed: false
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
