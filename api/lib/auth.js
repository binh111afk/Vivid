const jwt = require("jsonwebtoken");

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return secret;
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRES_IN },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getBearerToken(req) {
  const rawHeader = req?.headers?.authorization || req?.headers?.Authorization;

  if (!rawHeader || typeof rawHeader !== "string") {
    return "";
  }

  const [scheme, token] = rawHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token.trim();
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  getBearerToken,
};
