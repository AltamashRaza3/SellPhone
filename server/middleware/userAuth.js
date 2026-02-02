import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

/* ======================================================
   USER AUTH MIDDLEWARE
====================================================== */
const userAuth = async (req, res, next) => {
  try {
    /* ======================================================
       1️⃣ FIREBASE TOKEN (MOBILE / API CLIENTS)
    ====================================================== */
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const firebaseToken = authHeader.split(" ")[1];

      try {
        const decoded = await admin.auth().verifyIdToken(firebaseToken);

        if (!decoded?.uid || !decoded?.email) {
          return res.status(401).json({ message: "Invalid Firebase token" });
        }

        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          role: "user",
          authType: "firebase",
        };

        return next();
      } catch (err) {
        // ❗ DO NOT return — fallback to cookie JWT
        console.warn("Firebase token failed, trying JWT cookie");
      }
    }

    /* ======================================================
       2️⃣ JWT COOKIE (WEB CLIENT)
    ====================================================== */
    const cookieToken = req.cookies?.token;

    if (!cookieToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    if (!decoded?.sub || decoded.iss !== "sellphone-api") {
      return res.status(401).json({ message: "Invalid session token" });
    }

    req.user = {
      uid: decoded.sub,
      email: decoded.email,
      role: decoded.role || "user",
      authType: "jwt",
    };

    next();
  } catch (err) {
    console.error("USER AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default userAuth;
