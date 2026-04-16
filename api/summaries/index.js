const connectToDatabase = require("../../lib/db");
const Summary = require("../../models/Summary");
const { getBearerToken, verifyAccessToken } = require("../../lib/auth");

function sendResponse(target, status, body) {
  if (target?.res && typeof target.res.status === "function") {
    if (typeof target.res.setHeader === "function") {
      target.res.setHeader("Cache-Control", "no-store");
    }
    return target.res.status(status).json(body);
  }

  if (target?.context) {
    target.context.res = {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body,
    };
    return target.context.res;
  }
}

function getAuthenticatedUsername(req) {
  try {
    const token = getBearerToken(req);
    if (!token) return "";
    const payload = verifyAccessToken(token);
    return typeof payload?.username === "string" ? payload.username.trim().toLowerCase() : "";
  } catch (err) {
    return "";
  }
}

async function handleGetSummaries(target) {

  try {
    const authUsername = getAuthenticatedUsername(target.req);
    if (!authUsername) {
      return sendResponse(target, 401, { message: "Thiếu hoặc sai token xác thực." });
    }

    await connectToDatabase();
    
    // Fetch user's summaries (removed index-dependent sort, use client-side or implicit sort)
    const summaries = await Summary.find({ username: authUsername })
      .lean();

    summaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Map to frontend expected shape if possible or just send raw
    return sendResponse(target, 200, {
      summaries: summaries.map(s => ({
        id: s._id,
        type: s.type, // 'day', 'week', 'month'
        dateString: s.dateString,
        text: s.content,
        username: s.username,
        createdAt: s.createdAt,
      }))
    });

  } catch (error) {
    console.error("[Summaries] Error while fetching summaries", error);
    return sendResponse(target, 500, {
      message: "Không thể lấy danh sách tổng kết.",
      detail: error.message || error.toString() // Debug info
    });
  }
}

module.exports = async function summariesHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handleGetSummaries({
      context: null,
      req,
      res,
    });
  }

  return handleGetSummaries({
    context: arg1,
    req: arg2,
  });
};
