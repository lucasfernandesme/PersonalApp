import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

console.log("[DEBUG] Mobile Subscription Webhook started (RevenueCat)");

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get("Authorization");
        const expectedAuth = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");

        // Basic Authorization Check
        if (expectedAuth && authHeader !== expectedAuth) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const event = body.event;

        if (!event) {
            return new Response("Invalid Payload", { status: 400 });
        }

        console.log(`[DEBUG] Received Event: ${event.type}`);

        // Extract User ID (RevenueCat App User ID should be the Supabase User ID)
        const supabaseId = event.app_user_id;

        if (!supabaseId) {
            console.error("[ERROR] No app_user_id found in event");
            return new Response("Missing app_user_id", { status: 400 });
        }

        let updateData = {};

        switch (event.type) {
            case "INITIAL_PURCHASE":
            case "RENEWAL":
            case "UNCANCELLATION":
                updateData = {
                    subscription_status: "active",
                    subscription_price_id: event.product_id, // e.g. "pro_monthly"
                    subscription_end_date: new Date(event.expiration_at_ms).toISOString(),
                    subscription_source: "google_play", // Assuming RevenueCat is handling Google Play for now
                    subscription_external_id: event.original_transaction_id
                };
                break;

            case "CANCELLATION":
            case "EXPIRATION":
                // If it's cancellation, they might still have time left, but usually we just track active/inactive
                // For simplified logic, if it expires, it's done. If canceled, it might still be active until end date.
                // RevenueCat sends EXPIRATION when it's actually done.
                if (event.type === "EXPIRATION") {
                    updateData = {
                        subscription_status: "canceled",
                        subscription_end_date: new Date().toISOString(), // Ended now
                        subscription_source: "google_play"
                    };
                } else {
                    // CANCELLATION means auto-renew turned off usually, but access remains until period end
                    // We might not want to kill access immediately. 
                    // Let's trust the expiration_at_ms if present, otherwise just mark as canceled status but keep date.
                    updateData = {
                        subscription_status: "canceled",
                        // Don't change end date if not provided, just status
                    };
                    if (event.expiration_at_ms) {
                        updateData.subscription_end_date = new Date(event.expiration_at_ms).toISOString();
                    }
                }
                break;

            case "TEST":
                console.log("[DEBUG] Test Event Received");
                return new Response("Test OK", { status: 200 });
        }

        if (Object.keys(updateData).length > 0) {
            console.log(`[DEBUG] Updating User ${supabaseId}`, updateData);
            const { error } = await supabaseAdmin
                .from("trainers")
                .update(updateData)
                .eq("id", supabaseId);

            if (error) {
                console.error("[ERROR] Database Update Failed:", error);
                return new Response("Database Error", { status: 500 });
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
