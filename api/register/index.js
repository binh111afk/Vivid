const bcrypt = require("bcryptjs");

const connectToDatabase = require("../../lib/db");
const { signAccessToken } = require("../../lib/auth");
const User = require("../../models/User");

function buildAvatar(displayName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=800020&color=FFFDD0&bold=true`;
}

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

async function handleRegister(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Register] Request received");
    await connectToDatabase();
    logger.info("[Register] Database connection ready");

    const requestBody = target.req?.body || {};
    const username = typeof requestBody.username === "string" ? requestBody.username.trim().toLowerCase() : "";
    const password = typeof requestBody.password === "string" ? requestBody.password : "";
    const displayNameRaw = typeof requestBody.displayName === "string" ? requestBody.displayName.trim() : "";
    const displayName = displayNameRaw || username;

    logger.info("[Register] Parsed payload", { username, displayName });

    if (!username || !password) {
      return sendResponse(target, 400, {
        message: "Username và password là bắt buộc.",
      });
    }

    if (password.length < 6) {
      return sendResponse(target, 400, {
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const existingUser = await User.findOne({ username });
    logger.info("[Register] Existing user lookup completed", { exists: Boolean(existingUser) });

    if (existingUser) {
      return sendResponse(target, 409, {
        message: "Tên đăng nhập đã tồn tại.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    logger.info("[Register] Password hashed successfully");

    const user = await User.create({
      username,
      password: hashedPassword,
      displayName,
      avatar: buildAvatar(displayName),
    });
    logger.info("[Register] User created successfully", { userId: user._id.toString() });
    const token = signAccessToken(user);

    return sendResponse(target, 201, {
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    logger.error("[Register] Error", error);
    return sendResponse(target, 500, {
      message: "Không thể đăng ký lúc này.",
      detail: error?.message || "Unknown register error",
    });
  }
}

module.exports = async function registerHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handleRegister({
      context: null,
      req,
      res,
    });
  }

  return handleRegister({
    context: arg1,
    req: arg2,
  });
};
