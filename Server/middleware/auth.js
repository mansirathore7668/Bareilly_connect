const User = require("../models/User");
const { getTokenFromRequest, verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  (async () => {
    try {
      const token = getTokenFromRequest(req);
      const secret = process.env.JWT_SECRET || "localconnect-secret";

      if (!token) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const payload = verifyToken(token, secret);
      const user = await User.findById(payload.sub).populate("favorites");

      if (!user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      req.auth = payload;
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
  })();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }

  return next();
}

function attachUserIfPresent(req, res, next) {
  (async () => {
    try {
      const token = getTokenFromRequest(req);
      if (token) {
        const payload = verifyToken(token, process.env.JWT_SECRET || "localconnect-secret");
        const user = await User.findById(payload.sub).populate("favorites");
        if (user) {
          req.auth = payload;
          req.user = user;
        }
      }
    } catch {
      // Public requests remain public when an optional token is invalid.
    }
    return next();
  })();
}

module.exports = {
  requireAuth,
  requireAdmin,
  attachUserIfPresent,
};
