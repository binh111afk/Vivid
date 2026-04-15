const { app } = require("@azure/functions");
const bcrypt = require("bcryptjs");

const { getUsersCollection } = require("../shared/mongoClient");

app.http("login", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "login",
  handler: async (request, context) => {
    try {
      const { username, password } = await request.json();

      const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
      const normalizedPassword = typeof password === "string" ? password : "";

      if (!normalizedUsername || !normalizedPassword) {
        return {
          status: 400,
          jsonBody: {
            message: "Username và password là bắt buộc.",
          },
        };
      }

      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({ username: normalizedUsername });

      if (!user) {
        return {
          status: 401,
          jsonBody: {
            message: "Thông tin đăng nhập không đúng.",
          },
        };
      }

      const isPasswordValid = await bcrypt.compare(normalizedPassword, user.passwordHash);

      if (!isPasswordValid) {
        return {
          status: 401,
          jsonBody: {
            message: "Thông tin đăng nhập không đúng.",
          },
        };
      }

      return {
        status: 200,
        jsonBody: {
          user: {
            id: user._id.toString(),
            username: user.username,
            displayName: user.displayName || user.username,
            createdAt: user.createdAt,
          },
        },
      };
    } catch (error) {
      context.error("Login failed", error);

      return {
        status: 500,
        jsonBody: {
          message: "Không thể đăng nhập lúc này.",
        },
      };
    }
  },
});
