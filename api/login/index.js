const bcrypt = require("bcryptjs");

const connectToDatabase = require("../../lib/db");
const { signAccessToken } = require("../../lib/auth");
const User = require("../../models/User");

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

async function handleLogin(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Login] Request received");
    await connectToDatabase();
    logger.info("[Login] Database connection ready");

    const requestBody = target.req?.body || {};
    const username = typeof requestBody.username === "string" ? requestBody.username.trim().toLowerCase() : "";
    const password = typeof requestBody.password === "string" ? requestBody.password : "";

    logger.info("[Login] Parsed payload", { username });

    if (!username || !password) {
      return sendResponse(target, 400, {
        message: "Username và password là bắt buộc.",
      });
    }

    const user = await User.findOne({ username });
    logger.info("[Login] User lookup completed", { exists: Boolean(user) });

    if (!user) {
      return sendResponse(target, 401, {
        message: "Thông tin đăng nhập không đúng.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    logger.info("[Login] Password comparison completed", { isPasswordValid });

    if (!isPasswordValid) {
      return sendResponse(target, 401, {
        message: "Thông tin đăng nhập không đúng.",
      });
    }

    logger.info("[Login] Login successful", { userId: user._id.toString() });
    const token = signAccessToken(user);

    return sendResponse(target, 200, {
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    logger.error("[Login] Error", error);
    return sendResponse(target, 500, {
      message: "Không thể đăng nhập lúc này.",
      detail: error?.message || "Unknown login error",
    });
  }
}

module.exports = async function loginHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handleLogin({
      context: null,
      req,
      res,
    });
  }

  return handleLogin({
    context: arg1,
    req: arg2,
  });
};
