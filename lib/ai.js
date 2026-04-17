const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

function hasAzureOpenAIConfig() {
  return Boolean(apiKey && endpoint && deploymentId);
}

function buildChatCompletionUrl() {
  const normalizedEndpoint = String(endpoint || "").replace(/\/+$/, "");
  return `${normalizedEndpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
}

async function callAzureChat({ messages, maxTokens = 250, temperature = 0.7 }) {
  if (!hasAzureOpenAIConfig()) {
    return null;
  }

  const response = await fetch(buildChatCompletionUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature,
      max_completion_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Azure OpenAI error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content || null;
}

async function generateCommentForDay({ username, dateString, posts = [], photoCount = 0 }) {
  const fallbackComment = `Hôm nay bạn ${username} đã chia sẻ ${photoCount} khoảnh khắc tuyệt vời. Cứ tiếp tục lưu giữ những kỷ niệm đẹp nhé!`;

  if (!hasAzureOpenAIConfig()) return fallbackComment;

  try {
    const validPosts = posts.slice(0, 5); // Limit images sent to AI to 5 latest

    const captionsList = validPosts
      .map((p) => p.caption ? String(p.caption).trim() : "")
      .filter(Boolean)
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n") || "Không có ghi chú cụ thể.";

    const contentArray = [
      {
        type: "text",
        text: `Người dùng: ${username}\nNgày: ${dateString}\nSố ảnh đã đăng trong ngày: ${photoCount}\nDanh sách ghi chú tóm tắt:\n${captionsList}\n\nDưới đây là ảnh (tối đa 5 ảnh). Hãy viết một nhận xét cho hôm nay.`,
      }
    ];

    validPosts.forEach(post => {
      if (post.photo) {
        contentArray.push({
          type: "image_url",
          image_url: {
            url: post.photo
          }
        });
      }
    });

    const messages = [
      {
        role: "system",
        content: `Bạn là một người bạn thân thiết của người dùng, luôn quan sát và phản hồi lại những khoảnh khắc họ ghi lại trong ngày. Nhiệm vụ của bạn là đọc nội dung từ hình ảnh và ghi chú, sau đó đưa ra một phản hồi ngắn (1–2 câu) tự nhiên, giống cách một người bạn thật sự sẽ nói.

Nguyên tắc phản hồi:
- Luôn bám sát nội dung: Phản hồi phải liên quan trực tiếp đến những gì người dùng vừa trải qua, không nói chung chung hoặc mơ hồ.
- Phù hợp cảm xúc (rất quan trọng):
  + Nếu là thành tựu / điều tích cực → ghi nhận cụ thể + khích lệ nhẹ.
  + Nếu là khoảnh khắc nhỏ / đời thường → làm nó trở nên đáng nhớ bằng cách nhận xét tinh tế hoặc dễ thương.
  + Nếu là trải nghiệm tiêu cực → ưu tiên đồng cảm, an ủi nhẹ nhàng; có thể thêm chút hài hước tinh tế nếu phù hợp, nhưng không được đùa quá trớn.
- Giọng điệu như bạn bè: Dùng ngôn ngữ tự nhiên, gần gũi, giống cách nói chuyện hàng ngày. Có thể pha chút đùa nhẹ, ấm áp, hoặc đáng yêu tùy ngữ cảnh. Tránh hoàn toàn văn phong “truyền động lực”, “giảng dạy” hoặc sáo rỗng.
- Không phán xét – không dạy đời: Không đưa lời khuyên dài dòng. Không đánh giá đúng/sai hành động. Chỉ ghi nhận, đồng hành và phản hồi.
- Cụ thể hóa thay vì chung chung: Nhắc lại chi tiết nhỏ trong nội dung để tạo cảm giác được quan tâm thật sự.
- Giữ độ ngắn gọn: Tối đa 1–2 câu. Không lan man, không giải thích dài.
- Tạo cảm giác được ghi nhận: Mỗi phản hồi phải khiến người dùng cảm thấy “được thấy”, “được hiểu” hoặc “được công nhận”, dù ngày đó tốt hay xấu.

Mục tiêu cuối cùng:
Phản hồi của bạn phải khiến người dùng cảm thấy như có một người bạn luôn ở đó, nhìn thấy những gì họ làm được và nhẹ nhàng ở bên họ mỗi ngày.`
      },
      {
        role: "user",
        content: contentArray,
      },
    ];

    const result = await callAzureChat({
      messages,
      temperature: 0.7,
      maxTokens: 180,
    });

    return result || fallbackComment;
  } catch (error) {
    console.error("[AI] Error generating day comment:", error);
    return fallbackComment;
  }
}

async function summarizePeriod({ comments = [], periodType, periodLabel }) {
  const joinedComments = comments.join("\n- ");
  const periodName = periodType === "week" ? "tuần" : "tháng";
  const fallbackSummary = `Tổng kết ${periodLabel || periodName}: Thật tuyệt vời khi nhìn lại những kỷ niệm đẹp đã qua. Hãy trân trọng từng phút giây nhé!`;

  if (!hasAzureOpenAIConfig() || !comments || comments.length === 0) return fallbackSummary;

  try {
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

    const result = await callAzureChat({
      messages,
      temperature: 0.7,
      maxTokens: 250,
    });

    return result || fallbackSummary;
  } catch (error) {
    console.error(`[AI] Error generating ${periodType} comment:`, error);
    return fallbackSummary;
  }
}

module.exports = {
  generateCommentForDay,
  summarizePeriod
};