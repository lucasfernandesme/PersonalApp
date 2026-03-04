
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as djwt from "https://deno.land/x/djwt@v2.8/mod.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function getAccessToken(creds: any) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const header: djwt.Header = { alg: "RS256", typ: "JWT" };
    const payload = {
        iss: creds.client_email,
        sub: creds.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat,
        exp,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = creds.private_key
        .replace(pemHeader, "")
        .replace(pemFooter, "")
        .replace(/\s/g, "");

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const jwt = await djwt.create(header, payload, key);

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    const data = await response.json();
    return data.access_token;
}

serve(async (req) => {
    try {
        const { targetId, targetRole, title, body, data } = await req.json();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. SAVE TO DATABASE (Persistence)
        const { error: dbError } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: targetId,
                    user_role: targetRole,
                    title,
                    body,
                    data: data || {}
                }
            ]);

        if (dbError) console.error("Error saving notification to DB:", dbError);

        // 2. FETCH FCM TOKEN
        const table = targetRole === 'TRAINER' ? 'trainers' : 'students';
        const { data: user, error: userError } = await supabase
            .from(table)
            .select('fcm_token, name')
            .eq('id', targetId)
            .single();

        if (userError || !user?.fcm_token) {
            return new Response(JSON.stringify({ success: true, message: 'Saved to DB, but no FCM token found' }));
        }

        // 3. SEND PUSH
        const credsJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
        if (!credsJson) return new Response(JSON.stringify({ error: 'Config missing' }), { status: 500 });

        const creds = JSON.parse(credsJson);
        const token = await getAccessToken(creds);

        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${creds.project_id}/messages:send`;
        const response = await fetch(fcmUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: {
                    token: user.fcm_token,
                    notification: { title, body },
                    data: data || {}
                }
            }),
        });

        return new Response(JSON.stringify(await response.json()));
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
