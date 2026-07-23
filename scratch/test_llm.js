require('dotenv').config();
const { OpenAI } = require('openai');

async function testLLM() {
    console.log("=== STARTING LITELLM TEST ===");
    console.log("BASE_URL:", process.env.AI_BASE_URL);
    console.log("API_KEY (masked):", process.env.AI_API_KEY ? process.env.AI_API_KEY.substring(0, 5) + "..." : "undefined");
    console.log("MODEL_AI in env:", process.env.MODEL_AI || "empty");
    
    // 1. Try to fetch available models via raw fetch
    try {
        console.log("\n--- Testing /v1/models endpoint ---");
        const fetch = (await import('node-fetch')).default || global.fetch;
        const url = `${process.env.AI_BASE_URL}/models`; // typical for LiteLLM
        const url2 = `${process.env.AI_BASE_URL}/v1/models`; // typical for OpenAI standard
        
        let res = await fetch(url2, {
            headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` }
        });
        
        if (!res.ok) {
            console.log(`GET /v1/models failed with ${res.status}. Trying /models...`);
            res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` }
            });
        }
        
        if (res.ok) {
            const data = await res.json();
            const models = data.data ? data.data.map(m => m.id) : [];
            console.log("Available models:", models);
        } else {
            console.log("Failed to fetch models list. Status:", res.status);
            console.log(await res.text());
        }
    } catch (e) {
        console.log("Fetch models error:", e.message);
    }

    // 2. Try simple chat completion with OpenAI SDK
    const client = new OpenAI({
        apiKey: process.env.AI_API_KEY,
        baseURL: process.env.AI_BASE_URL
    });

    const modelToUse = process.env.MODEL_AI || "gpt-4o-mini";
    console.log(`\n--- Testing Chat Completion with model: '${modelToUse}' ---`);
    
    try {
        const response = await client.chat.completions.create({
            model: modelToUse,
            messages: [{ role: "user", content: "Say hello!" }],
            max_tokens: 10
        });
        
        console.log("SUCCESS! Response:");
        console.log(response.choices[0].message.content);
    } catch (err) {
        console.error("COMPLETION FAILED!");
        console.error("Status:", err.status);
        console.error("Name:", err.name);
        console.error("Message:", err.message);
        if (err.error) {
            console.error("Raw Error Object:", JSON.stringify(err.error, null, 2));
        }
    }
}

testLLM();
