const connectToDatabase = require("../lib/db");
const { getBearerToken, verifyAccessToken } = require("../lib/auth");
const { uploadImageFromDataUrl, ensureReadableImageUrl, deleteImageByUrl } = require("../lib/storage");
const FeedPost = require("../models/FeedPost");
const User = require("../models/User");

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
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

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
