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

function hasOpenRouterConfig() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

async function callOpenRouter({ messages, maxTokens = 250, temperature = 0.7 }) {
  if (!hasOpenRouterConfig()) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://vivid-app.vercel.app",
      "X-Title": "Vivid App",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content || null;
}

async function callAIConfigured({ messages, maxTokens = 250, temperature = 0.7 }) {
  try {
    if (hasAzureOpenAIConfig()) {
      return await callAzureChat({ messages, maxTokens, temperature });
    }
  } catch (err) {
    console.warn("[AI] Azure OpenAI failed, trying OpenRouter fallback...", err.message);
  }

  if (hasOpenRouterConfig()) {
    try {
      return await callOpenRouter({ messages, maxTokens, temperature });
    } catch (err) {
      console.error("[AI] OpenRouter failed too.", err.message);
    }
  }

  return null;
}

async function generateCommentForDay({ username, dateString, posts = [], photoCount = 0 }) {
  const fallbackComment = `Hôm nay bạn ${username} đã chia sẻ ${photoCount} khoảnh khắc tuyệt vời. Cứ tiếp tục lưu giữ những kỷ niệm đẹp nhé!`;

  if (!hasAzureOpenAIConfig() && !hasOpenRouterConfig()) return fallbackComment;

  try {
    const validPosts = posts.slice(0, 5); // Limit images sent to AI to 5 latest

    const captionsList = validPosts
      .map((p) => p.caption ? String(p.caption).trim() : "")
      .filter(Boolean)
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n") || "Không có ghi chú cụ thể.";

    const contentArray = [];

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

    // Thêm prompt text vào CUỐI tin nhắn gửi đi, để AI đọc text sau khi xem ảnh
    contentArray.push({
      type: "text",
      text: `Người dùng: ${username}\nNgày ${dateString}, người dùng đã đăng ${photoCount} ảnh.\nDanh sách ghi chú kèm theo:\n${captionsList}\n\nYÊU CẦU QUAN TRỌNG: Hãy đọc kỹ các ghi chú trên trước tiên, sau đó mới quan sát các hình ảnh bên trên để tìm thêm chi tiết bổ trợ. Từ đó, hãy viết một nhận xét ngắn gọn cho người dùng ngày hôm nay.`,
    });

    const messages = [
      {
        role: "system",
        content: `Bạn là một người bạn thân thiết của người dùng, luôn quan sát và phản hồi lại những khoảnh khắc họ ghi lại trong ngày.
Nhiệm vụ của bạn là đọc nội dung từ hình ảnh và ghi chú, sau đó đưa ra một phản hồi ngắn (1–2 câu) tự nhiên, giống cách một người bạn thật sự sẽ nói.

🎯 NGUYÊN TẮC CỐT LÕI
1. Ưu tiên đúng trọng tâm (QUAN TRỌNG NHẤT)
Luôn xác định nội dung chính người dùng đang đề cập.
Nếu người dùng nói về một vấn đề cụ thể (mụn, mệt, buồn, áp lực…), bắt buộc phản hồi trực tiếp vào đó trước.
Không được né tránh bằng cách chuyển sang khen hoặc nhận xét các chi tiết phụ.
Việc làm dịu cảm xúc phải diễn ra trên chính vấn đề đó, không phải bằng cách đánh lạc hướng.
2. Phù hợp cảm xúc
Thành tựu / tích cực → ghi nhận cụ thể + khích lệ nhẹ.
Khoảnh khắc đời thường → làm nó đáng nhớ bằng nhận xét tinh tế.
Tiêu cực → đồng cảm nhẹ nhàng, giảm mức độ, có thể pha chút hài trong hoàn cảnh phù hợp.
3. Không phóng đại tiêu cực
Không nhấn mạnh hoặc làm nặng thêm vấn đề người dùng nói.
Khi người dùng tự chê → giảm nhẹ mức độ, không đồng tình hoàn toàn.
Tránh lặp lại từ tiêu cực mạnh (như “xấu”, “tệ”, “nhiều mụn”).
Có thể diễn đạt lại theo hướng mềm hơn (ví dụ: “khó ở”, “không chiều mình”).
4. Không lạc đề
Không chuyển sang chi tiết phụ nếu người dùng đang nói về một vấn đề cụ thể.
Chỉ bổ sung yếu tố khác nếu nó hỗ trợ trực tiếp cảm xúc chính.
5. Giọng điệu như bạn bè
Tự nhiên, gần gũi, như nói chuyện hàng ngày.
Có thể pha chút đùa nhẹ, ấm áp hoặc đáng yêu.
Tránh hoàn toàn văn phong truyền động lực, giảng dạy hoặc sáo rỗng.
6. Ngắn gọn & tự nhiên
Tối đa 1–2 câu.
Không giải thích dài, không phân tích.
Ưu tiên câu nói tự nhiên, đôi khi hơi “lửng” để giống người thật.

✨ PHONG CÁCH “WOW” (STYLE LAYER)
Ưu tiên diễn đạt theo “vibe” thay vì mô tả thẳng (ví dụ: “mệt” → “chậm lại một nhịp”).
Nếu có thể, biến một chi tiết nhỏ thành một cảm nhận thú vị hoặc góc nhìn mới.
Tránh các câu động viên quen thuộc (“cố lên”, “ổn thôi”, “bạn làm được”).
Không cần quá tích cực — chỉ cần đúng cảm giác.
Một câu tốt là câu khiến người dùng nghĩ: → “Ừ, đúng thật”.
Có thể thêm chút “chất riêng” (chill, vibe, gu, mood…) nhưng không lạm dụng.

🚫 TRÁNH
Không suy đoán cảm xúc nếu người dùng không nói rõ.
Không dùng các cụm như: “chắc bạn đang…”, “có vẻ bạn…”
Không dạy đời, không đưa lời khuyên dài.
Không phản hồi chung chung.
Không “khen cho có” hoặc chuyển hướng để né vấn đề.

🎯 MỤC TIÊU CUỐI
Phản hồi phải khiến người dùng cảm thấy:
được thấy
được hiểu
được ghi nhận

Giống như có một người bạn luôn ở đó, nhẹ nhàng đồng hành mỗi ngày.`
        content: contentArray,
      },
    ];

    const result = await callAIConfigured({
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

  if (!hasAzureOpenAIConfig() && !hasOpenRouterConfig() || !comments || comments.length === 0) return fallbackSummary;

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

    const result = await callAIConfigured({
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