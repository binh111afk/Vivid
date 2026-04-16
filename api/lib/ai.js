const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

let client;
if (apiKey && endpoint) {
  client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
}

async function generateCommentForDay({ username, dateString, captions = [], photoCount = 0 }) {
  if (!client || !deploymentId) return null;

  try {
    const cleanCaptions = captions
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .slice(0, 20);
    const captionsList = cleanCaptions.length
      ? cleanCaptions.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : "Không có ghi chú cụ thể.";

    const messages = [
      {
        role: "system",
        content:
          "Bạn là một người bạn tâm giao. Hãy đưa ra một lời nhận xét tích cực, ngắn gọn (1-2 câu), dựa trên hoạt động trong ngày của người dùng.",
      },
      {
        role: "user",
        content:
          `Người dùng: ${username}\nNgày: ${dateString}\nSố ảnh đã đăng trong ngày: ${photoCount}\nDanh sách ghi chú:\n${captionsList}\n\nHãy viết một nhận xét cho hôm nay.`,
      },
    ];

    const result = await client.getChatCompletions(deploymentId, messages, {
      temperature: 0.7,
      maxTokens: 180,
    });

    return result.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("[AI] Error generating day comment:", error);
    return null;
  }
}

async function summarizePeriod({ comments = [], periodType, periodLabel }) {
  if (!client || !deploymentId || !comments || comments.length === 0) return null;

  try {
    const joinedComments = comments.join("\n- ");
    const periodName = periodType === "week" ? "tuần" : "tháng";

    const messages = [
      {
        role: "system",
        content:
          `Bạn là một trợ lý thông minh. Hãy tổng hợp các nhận xét theo ngày thành một nhận xét tổng kết ${periodName} ngắn gọn (2-3 câu), tích cực và truyền cảm hứng.`,
      },
      {
        role: "user",
        content:
          `Mốc thời gian: ${periodLabel || periodName}\nCác nhận xét theo ngày:\n- ${joinedComments}\n\nHãy tạo nhận xét tổng kết ${periodName}.`,
      },
    ];

    const result = await client.getChatCompletions(deploymentId, messages, {
      temperature: 0.7,
      maxTokens: 250,
    });

    return result.choices[0]?.message?.content || null;
  } catch (error) {
    console.error(`[AI] Error generating ${periodType} comment:`, error);
    return null;
  }
}

module.exports = {
  generateCommentForDay,
  summarizePeriod
};
