const bcrypt = require("bcryptjs");

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

async function handlePasswordChange(target) {
  const logger = createLogger(target.context);

  try {
    logger.info("[Password] Request received");
    await connectToDatabase();

    const requestBody = target.req?.body || {};
    const username = typeof requestBody.username === "string" ? requestBody.username.trim().toLowerCase() : "";
    const currentPassword = typeof requestBody.currentPassword === "string" ? requestBody.currentPassword : "";
    const newPassword = typeof requestBody.newPassword === "string" ? requestBody.newPassword : "";

    if (!username || !currentPassword || !newPassword) {
      return sendResponse(target, 400, {
        message: "Thiếu thông tin để đổi mật khẩu.",
      });
    }

    if (newPassword.length < 6) {
      return sendResponse(target, 400, {
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return sendResponse(target, 404, {
        message: "Không tìm thấy người dùng.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return sendResponse(target, 401, {
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    logger.info("[Password] Password updated", { userId: user._id.toString() });

    return sendResponse(target, 200, {
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    logger.error("[Password] Error", error);
    return sendResponse(target, 500, {
      message: "Không thể đổi mật khẩu lúc này.",
      detail: error?.message || "Unknown password error",
    });
  }
}

module.exports = async function changePasswordHandler(arg1, arg2) {
  const isVercelRuntime = Boolean(arg2 && typeof arg2.status === "function");

  if (isVercelRuntime) {
    const req = arg1;
    const res = arg2;

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handlePasswordChange({
      context: null,
      req,
      res,
    });
  }

  return handlePasswordChange({
    context: arg1,
    req: arg2,
  });
};
