const connectToDatabase = require("../lib/db");
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

async function handleProfileUpdate(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Profile] Request received");
    await connectToDatabase();

    const requestBody = target.req?.body || {};
    const username = typeof requestBody.username === "string" ? requestBody.username.trim().toLowerCase() : "";
    const displayNameRaw = typeof requestBody.displayName === "string" ? requestBody.displayName.trim() : "";
    const avatar = typeof requestBody.avatar === "string" ? requestBody.avatar : "";

    if (!username) {
      return sendResponse(target, 400, {
        message: "Thiếu username để cập nhật hồ sơ.",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return sendResponse(target, 404, {
        message: "Không tìm thấy người dùng.",
      });
    }

    if (displayNameRaw) {
      user.displayName = displayNameRaw;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();
    logger.info("[Profile] Profile updated", { userId: user._id.toString() });

    return sendResponse(target, 200, {
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error("[Profile] Error", error);
    return sendResponse(target, 500, {
      message: "Không thể cập nhật hồ sơ lúc này.",
      detail: error?.message || "Unknown profile error",
    });
  }
}

module.exports = async function profileHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    if (!["PATCH", "POST"].includes(req.method)) {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handleProfileUpdate({
      context: null,
      req,
      res,
    });
  }

  return handleProfileUpdate({
    context: arg1,
    req: arg2,
  });
};
