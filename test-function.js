
const supabaseUrl = 'https://oyngyejfahpzujskrywm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bmd5ZWpmYWhwenVqc2tyeXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDQyOTgsImV4cCI6MjA4NDc4MDI5OH0.6ljlYlPvo_BI87L1SeDsPGr8_P5wRQWHdvPI3G-R-Ac';

async function testFunction() {
    console.log('Testing create-checkout-session...');
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                // 'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ priceId: 'test' })
        });

        console.log('Status:', response.status);
        const data = await response.text();
        console.log('Response:', data);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testFunction();
