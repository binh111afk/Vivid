const { app } = require("@azure/functions");
const bcrypt = require("bcryptjs");

const { getUsersCollection } = require("../shared/mongoClient");

app.http("register", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "register",
  handler: async (request, context) => {
    try {
      const { username, password } = await request.json();

      const normalizedUsername = typeof username === "string" ? username.trim() : "";
      const normalizedPassword = typeof password === "string" ? password : "";

      if (!normalizedUsername || !normalizedPassword) {
        return {
          status: 400,
          jsonBody: {
            message: "Username và password là bắt buộc.",
          },
        };
      }

      if (normalizedPassword.length < 6) {
        return {
          status: 400,
          jsonBody: {
            message: "Mật khẩu cần ít nhất 6 ký tự.",
          },
        };
      }

      const usersCollection = await getUsersCollection();
      const existingUser = await usersCollection.findOne({
        username: normalizedUsername.toLowerCase(),
      });

      if (existingUser) {
        return {
          status: 409,
          jsonBody: {
            message: "Tên đăng nhập đã tồn tại.",
          },
        };
      }

      const passwordHash = await bcrypt.hash(normalizedPassword, 12);
      const now = new Date().toISOString();

      const userDocument = {
        username: normalizedUsername.toLowerCase(),
        displayName: normalizedUsername,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      };

      const result = await usersCollection.insertOne(userDocument);

      return {
        status: 201,
        jsonBody: {
          user: {
            id: result.insertedId.toString(),
            username: userDocument.username,
            displayName: userDocument.displayName,
            createdAt: userDocument.createdAt,
          },
        },
      };
    } catch (error) {
      context.error("Register failed", error);

      return {
        status: 500,
        jsonBody: {
          message: "Không thể đăng ký lúc này.",
        },
      };
    }
  },
});
