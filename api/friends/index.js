const mongoose = require("mongoose");
const connectToDatabase = require("../../lib/db");
const { getBearerToken, verifyAccessToken } = require("../../lib/auth");
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

function getAuthenticatedUsername(req) {
  try {
    const token = getBearerToken({ headers: req.headers });

    if (!token) {
      return "";
    }

    const payload = verifyAccessToken(token);
    return typeof payload?.username === "string" ? payload.username.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}

async function handleFriendsAPI(target) {
  const logger = createLogger(target.context || target.req);
  const req = target.req;
  const method = req.method ? req.method.toUpperCase() : "GET";

  try {
    logger.info(`[Friends] ${method} Request received`);
    const username = getAuthenticatedUsername(req);

    if (!username) {
      return sendResponse(target, 401, { message: "Không được phép truy cập." });
    }

    await connectToDatabase();
    logger.info(`[Friends] Database connected for user ${username}`);

    const user = await User.findOne({ username }).populate("friends").populate("friendRequests");
    if (!user) {
      return sendResponse(target, 404, { message: "Không tìm thấy người dùng." });
    }

    const mapUser = (u) => ({
      id: u._id,
      username: u.username,
      name: u.displayName || u.username,
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || u.username)}&background=800020&color=FFFDD0&bold=true`
    });

    if (method === "GET") {
      return sendResponse(target, 200, {
        friends: (user.friends || []).map(mapUser),
        friendRequests: (user.friendRequests || []).map(mapUser)
      });
    }

    if (method === "POST") {
      const { targetUsername } = req.body || {};
      const targetUserLower = targetUsername ? targetUsername.trim().toLowerCase() : "";

      if (!targetUserLower || targetUserLower === username) {
        return sendResponse(target, 400, { message: "Tên người dùng không hợp lệ." });
      }

      const targetUser = await User.findOne({ username: targetUserLower });
      if (!targetUser) {
        return sendResponse(target, 404, { message: "Không tìm thấy người dùng." });
      }

      const userIdStr = user._id.toString();
      const targetUserFriendsStr = targetUser.friends.map(id => id.toString());
      const targetUserReqsStr = targetUser.friendRequests.map(id => id.toString());

      if (targetUserFriendsStr.includes(userIdStr)) {
        return sendResponse(target, 400, { message: "Các bạn đã là bạn bè." });
      }

      if (targetUserReqsStr.includes(userIdStr)) {
        return sendResponse(target, 400, { message: "Đã gửi lời mời kết bạn trước đó." });
      }

      // Check if targetUser already sent us a request, in which case we accept it.
      if (user.friendRequests.some(r => r._id.toString() === targetUser._id.toString())) {
        user.friendRequests = user.friendRequests.filter(r => r._id.toString() !== targetUser._id.toString());
        user.friends.push(targetUser._id);
        targetUser.friends.push(user._id);
        await user.save();
        await targetUser.save();
        return sendResponse(target, 200, { message: "Đã chấp nhận lời mời kết bạn do người này đã gửi lời mời cho bạn." });
      }

      targetUser.friendRequests.push(user._id);
      await targetUser.save();

      return sendResponse(target, 200, { message: "Đã gửi lời mời kết bạn thành công." });
    }

    if (method === "PUT") {
      const { senderUsername } = req.body || {};
      const senderUserLower = senderUsername ? senderUsername.trim().toLowerCase() : "";

      const sender = await User.findOne({ username: senderUserLower });
      if (!sender) {
        return sendResponse(target, 404, { message: "Không tìm thấy người dùng gửi lời mời." });
      }

      const senderIdStr = sender._id.toString();
      if (!user.friendRequests.some(r => r._id.toString() === senderIdStr)) {
        return sendResponse(target, 400, { message: "Không có lời mời kết bạn nào từ người này." });
      }

      user.friendRequests = user.friendRequests.filter(r => r._id.toString() !== senderIdStr);
      
      const userFriendsStr = user.friends.map(f => f._id.toString());
      if (!userFriendsStr.includes(senderIdStr)) {
        user.friends.push(sender._id);
      }

      const senderFriendsStr = sender.friends.map(id => id.toString());
      if (!senderFriendsStr.includes(user._id.toString())) {
        sender.friends.push(user._id);
      }

      await user.save();
      await sender.save();

      return sendResponse(target, 200, { message: "Đã chấp nhận lời mời kết bạn." });
    }

    if (method === "DELETE") {
      const { targetUsername } = req.body || {};
      const targetUserLower = targetUsername ? targetUsername.trim().toLowerCase() : "";

      const targetUser = await User.findOne({ username: targetUserLower });
      if (!targetUser) {
        return sendResponse(target, 404, { message: "Không tìm thấy người dùng." });
      }

      const targetIdStr = targetUser._id.toString();
      
      // Remove from friend requests and friends
      user.friendRequests = user.friendRequests.filter(r => r._id.toString() !== targetIdStr);
      user.friends = user.friends.filter(f => f._id.toString() !== targetIdStr);
      
      targetUser.friendRequests = targetUser.friendRequests.filter(id => id.toString() !== user._id.toString());
      targetUser.friends = targetUser.friends.filter(id => id.toString() !== user._id.toString());

      await user.save();
      await targetUser.save();

      return sendResponse(target, 200, { message: "Đã xóa thành công." });
    }

    return sendResponse(target, 405, { message: "Phương thức không được hỗ trợ." });
  } catch (error) {
    logger.error("[Friends] Error processing request:", error);
    return sendResponse(target, 500, { message: "Đã xảy ra lỗi hệ thống." });
  }
}

module.exports = async function (context, req) {
  if (context && context.req) {
    return handleFriendsAPI({ context, req: context.req });
  } else {
    // Local express-like
    return handleFriendsAPI({ req: context, res: req });
  }
};