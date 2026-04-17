const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if(key) process.env[key.trim()] = val.join('=').trim();
});
const { AzureOpenAI } = require("@azure/openai");

async function testAzure() {
    try {
        console.log("--- BẮT ĐẦU GỌI AI ---");
        console.log("Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);
        console.log("Deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME);

        const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`, {
            method: "POST",
            headers: {
                "api-key": process.env.AZURE_OPENAI_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: "Chào bạn" }],
                max_completion_tokens: 10,
                temperature: 0.7
            })
        });
        const payload = await response.json();
        console.log("STATUS HTTP:", response.status);
        console.log("PAYLOAD AI TRẢ VỀ:", JSON.stringify(payload, null, 2));

        if (!response.ok) {
            console.error("!!! LỖI RỒI BÌNH ƠI !!!");
            console.error("Mã lỗi HTTP:", response.status);
            console.error("Chi tiết từ Azure:", payload.error?.message || payload);
        }
    } catch (err) {
        console.error("Lỗi fetch:", err.message);
    }
}
testAzure();