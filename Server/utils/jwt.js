const crypto = require("crypto");

function base64UrlEncode(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function base64UrlDecode(input) {
  return JSON.parse(Buffer.from(input, "base64url").toString("utf8"));
}

function signToken(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

  return `${data}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== "string") {
    throw new Error("Missing token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = base64UrlDecode(encodedPayload);

  if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const tokenCookie = cookies.find((item) => item.startsWith("token="));

  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(tokenCookie.slice(6));
}

module.exports = {
  getTokenFromRequest,
  signToken,
  verifyToken,
};
