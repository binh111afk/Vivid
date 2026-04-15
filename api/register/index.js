const bcrypt = require("bcryptjs");

const connectToDatabase = require("../lib/db");
const User = require("../models/User");

function buildAvatar(displayName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=800020&color=FFFDD0&bold=true`;
}

module.exports = async function (context, req) {
  try {
    await connectToDatabase();

    const username = typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const displayNameRaw = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
    const displayName = displayNameRaw || username;

    if (!username || !password) {
      context.res = {
        status: 400,
        body: {
          message: "Username và password là bắt buộc.",
        },
      };
      return;
    }

    if (password.length < 6) {
      context.res = {
        status: 400,
        body: {
          message: "Mật khẩu phải có ít nhất 6 ký tự.",
        },
      };
      return;
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      context.res = {
        status: 409,
        body: {
          message: "Tên đăng nhập đã tồn tại.",
        },
      };
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      password: hashedPassword,
      displayName,
      avatar: buildAvatar(displayName),
    });

    context.res = {
      status: 201,
      body: {
        user: {
          id: user._id.toString(),
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        },
      },
    };
  } catch (error) {
    context.log.error("Register error", error);
    context.res = {
      status: 500,
      body: {
        message: "Không thể đăng ký lúc này.",
      },
    };
  }
};
