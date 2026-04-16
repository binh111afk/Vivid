const connectToDatabase = require("../../lib/db");
const { getBearerToken, verifyAccessToken } = require("../../lib/auth");
const { uploadImageFromDataUrl, ensureReadableImageUrl, deleteImageByUrl } = require("../../lib/storage");
const FeedPost = require("../../models/FeedPost");
const User = require("../../models/User");
const Summary = require("../../models/Summary");
const { generateCommentForDay, summarizePeriod } = require("../../lib/ai");

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Ho_Chi_Minh";

function createLogger(context) {
  if (context?.log) {
    return {
      info: (...args) => context.log(...args),
      error: (...args) => context.log.error(...args),
    };
  }

  return {
    info: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
  };
}

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

    if (!token) {
      return "";
    }

    const payload = verifyAccessToken(token);
    return typeof payload?.username === "string" ? payload.username.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}

function getZonedDate(now = new Date()) {
  return new Date(now.toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
}

function toDateKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getIsoWeek(input) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return { year: date.getFullYear(), week: weekNo };
}

function toWeekKey(input) {
  const { year, week } = getIsoWeek(input);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function isEndOfWeek(input) {
  const date = input instanceof Date ? input : new Date(input);
  return date.getDay() === 0;
}

function isEndOfMonth(input) {
  const date = input instanceof Date ? input : new Date(input);
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  return next.getDate() === 1;
}

function getLastNDayKeys(zonedNow, days) {
  const keys = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(zonedNow);
    date.setDate(zonedNow.getDate() - i);
    keys.push(toDateKey(date));
  }
  return keys;
}

async function handleGetFeed(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Feed] Fetch feed request received");
    const authUsername = getAuthenticatedUsername(target.req);

    if (!authUsername) {
      return sendResponse(target, 401, {
        message: "Thiếu hoặc sai token xác thực.",
      });
    }

    await connectToDatabase();

    const posts = await FeedPost.find({})
        .limit(100)
        .lean();
      
      posts.sort((a,b) => b._id.toString().localeCompare(a._id.toString()));
    return sendResponse(target, 200, {
      posts: posts.map((post) => ({
        id: post.feedId,
        username: post.username,
        displayName: post.displayName,
        avatar: post.avatar,
        photo: ensureReadableImageUrl(post.photo),
        caption: post.caption,
        recipientIds: post.recipientIds,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    logger.error("[Feed] Error while fetching feed", error);
    return sendResponse(target, 500, {
      message: "Không thể tải feed lúc này.",
      detail: error?.message || "Unknown feed fetch error",
    });
  }
}

async function handleAIBackgroundTasks(username, caption, logger) {
  try {
    const nowZoned = getZonedDate();
    const dayKey = toDateKey(nowZoned);

    const recentPosts = await FeedPost.find({ username })
      .select({ caption: 1, createdAt: 1 })
        .limit(500)
        .lean();
      
      recentPosts.sort((a,b) => b._id.toString().localeCompare(a._id.toString()));
      const postZonedDate = getZonedDate(new Date(post.createdAt));
      return toDateKey(postZonedDate) === dayKey;
    });

    const todayCaptions = todayPosts
      .map((post) => (typeof post.caption === "string" ? post.caption.trim() : ""))
      .filter(Boolean);

    const daySummary = await generateCommentForDay({
      username,
      dateString: dayKey,
      captions: todayCaptions,
      photoCount: todayPosts.length,
    });

    if (daySummary) {
      await Summary.findOneAndUpdate(
        { username, type: "day", dateString: dayKey },
        { $set: { content: daySummary } },
        { upsert: true, new: true },
      );
      logger.info("[AI] Upserted day summary", { username, dayKey, photoCount: todayPosts.length });
    }

    if (isEndOfWeek(nowZoned)) {
      const weekKey = toWeekKey(nowZoned);
      const weekDayKeys = getLastNDayKeys(nowZoned, 7);
      const daySummaries = await Summary.find({
        username,
        type: "day",
        dateString: { $in: weekDayKeys },
      })
          .lean();
        
        daySummaries.sort((a,b) => a.dateString.localeCompare(b.dateString));
          periodType: "week",
          periodLabel: weekKey,
        });

        if (weekSummary) {
          await Summary.findOneAndUpdate(
            { username, type: "week", dateString: weekKey },
            { $set: { content: weekSummary } },
            { upsert: true, new: true },
          );
          logger.info("[AI] Upserted week summary", { username, weekKey });
        }
      }
    }

    if (isEndOfMonth(nowZoned)) {
      const monthKey = toMonthKey(nowZoned);
      const daySummaries = await Summary.find({
        username,
        type: "day",
        dateString: { $regex: `^${monthKey}-` },
      })
          .lean();
          
        daySummaries.sort((a,b) => a.dateString.localeCompare(b.dateString));
          periodType: "month",
          periodLabel: monthKey,
        });

        if (monthSummary) {
          await Summary.findOneAndUpdate(
            { username, type: "month", dateString: monthKey },
            { $set: { content: monthSummary } },
            { upsert: true, new: true },
          );
          logger.info("[AI] Upserted month summary", { username, monthKey });
        }
      }
    }

  } catch (error) {
    console.error("[AI] Background task error:", error);
  }
}

async function handleCreateFeedPost(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Feed] Create feed post request received");
    const authUsername = getAuthenticatedUsername(target.req);

    if (!authUsername) {
      return sendResponse(target, 401, {
        message: "Thiếu hoặc sai token xác thực.",
      });
    }

    await connectToDatabase();

    const requestBody = target.req?.body || {};
    const username = authUsername;
    const photo = typeof requestBody.photo === "string" ? requestBody.photo.trim() : "";
    const caption = typeof requestBody.caption === "string" ? requestBody.caption.trim().slice(0, 200) : "";
    const recipientIds = Array.isArray(requestBody.recipientIds)
      ? requestBody.recipientIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id))
      : [];

    if (!username || !photo) {
      return sendResponse(target, 400, {
        message: "Thiếu username hoặc ảnh để đăng feed.",
      });
    }

    const user = await User.findOne({ username }).lean();

    if (!user) {
      return sendResponse(target, 404, {
        message: "Không tìm thấy người dùng để đăng feed.",
      });
    }

    const photoUrl = await uploadImageFromDataUrl(photo, {
      username,
    });

    const post = await FeedPost.create({
      username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || "",
      photo: photoUrl,
      caption,
      recipientIds,
    });

    logger.info("[Feed] Feed post created", { feedId: post.feedId, username });

    await handleAIBackgroundTasks(username, caption, logger);

    return sendResponse(target, 201, {
      post: {
        id: post.feedId,
        username: post.username,
        displayName: post.displayName,
        avatar: post.avatar,
        photo: ensureReadableImageUrl(post.photo),
        caption: post.caption,
        recipientIds: post.recipientIds,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    logger.error("[Feed] Error while creating post", error);
    return sendResponse(target, 500, {
      message: "Không thể đăng ảnh lên feed lúc này.",
      detail: error?.message || "Unknown feed create error",
    });
  }
}

async function handleDeleteFeedPost(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Feed] Delete feed post request received");
    const authUsername = getAuthenticatedUsername(target.req);

    if (!authUsername) {
      return sendResponse(target, 401, {
        message: "Thiếu hoặc sai token xác thực.",
      });
    }

    await connectToDatabase();

    const requestBody = target.req?.body || {};
    const postIdRaw = requestBody.postId ?? requestBody.id;
    const postId = Number(postIdRaw);

    if (!Number.isFinite(postId)) {
      return sendResponse(target, 400, {
        message: "Thiếu postId hợp lệ để xóa ảnh.",
      });
    }

    const post = await FeedPost.findOne({ feedId: postId });

    if (!post) {
      return sendResponse(target, 404, {
        message: "Không tìm thấy ảnh để xóa.",
      });
    }

    if (post.username !== authUsername) {
      return sendResponse(target, 403, {
        message: "Bạn chỉ có thể xóa ảnh do chính bạn đăng.",
      });
    }

    await deleteImageByUrl(post.photo);
    await FeedPost.deleteOne({ _id: post._id });

    logger.info("[Feed] Feed post deleted", { feedId: post.feedId, username: authUsername });

    return sendResponse(target, 200, {
      message: "Đã xóa ảnh khỏi feed.",
      deletedId: post.feedId,
    });
  } catch (error) {
    logger.error("[Feed] Error while deleting post", error);
    return sendResponse(target, 500, {
      message: "Không thể xóa ảnh lúc này.",
      detail: error?.message || "Unknown feed delete error",
    });
  }
}

async function handleFeed(target) {
  const method = target.req?.method || "";

  if (method === "GET") {
    return handleGetFeed(target);
  }

  if (method === "POST") {
    return handleCreateFeedPost(target);
  }

  if (method === "DELETE") {
    return handleDeleteFeedPost(target);
  }

  return sendResponse(target, 405, {
    message: "Method not allowed",
  });
}

module.exports = async function feedHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    return handleFeed({
      context: null,
      req,
      res,
    });
  }

  return handleFeed({
    context: arg1,
    req: arg2,
  });
};
