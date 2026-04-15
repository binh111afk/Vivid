const bcrypt = require("bcryptjs");

const connectToDatabase = require("../lib/db");
const User = require("../models/User");

module.exports = async function (context, req) {
  try {
    await connectToDatabase();

    const username = typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !password) {
      context.res = {
        status: 400,
        body: {
          message: "Username và password là bắt buộc.",
        },
      };
      return;
    }

    const user = await User.findOne({ username });

    if (!user) {
      context.res = {
        status: 401,
        body: {
          message: "Thông tin đăng nhập không đúng.",
        },
      };
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      context.res = {
        status: 401,
        body: {
          message: "Thông tin đăng nhập không đúng.",
        },
      };
      return;
    }

    context.res = {
      status: 200,
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
    context.log.error("Login error", error);
    context.res = {
      status: 500,
      body: {
        message: "Không thể đăng nhập lúc này.",
      },
    };
  }
};
