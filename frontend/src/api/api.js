import axios from "axios";

const api = axios.create({
  baseURL: "https://manufacturing-trance-samba-stats.trycloudflare.com/api",
});

// Helper to generate SHA-256 HMAC signature in browser using Web Crypto API
async function generateSignature(key, data) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const msgData = encoder.encode(data);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
    );
    
    const signature = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        msgData
    );
    
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Request interceptor for JWT and Signature injection
api.interceptors.request.use(async (config) => {
    // 1. Inject JWT token if exists
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject Client Signature for recommendation V1
    if (config.url && config.url.includes("/v1/recomendation")) {
        let hospitalCode = "460261"; // Seeded fallback
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.hospital && user.hospital.hospital_code) {
                    hospitalCode = user.hospital.hospital_code;
                }
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
            }
        }
        
        // Seeded client key for hospital_code 460261
        const apiKey = "4ec46f92c5571cd4a8e88650a5d06b6455fa424a0edee2d34eb75c7a26bf492e";
        const timestamp = Date.now().toString();
        const rawData = hospitalCode + apiKey + timestamp;
        
        try {
            const signature = await generateSignature(apiKey, rawData);
            config.headers['x-api-key'] = apiKey;
            config.headers['x-hospital-code'] = hospitalCode;
            config.headers['x-timestamp'] = timestamp;
            config.headers['x-signature'] = signature;
        } catch (e) {
            console.error("Failed to generate API signature:", e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;