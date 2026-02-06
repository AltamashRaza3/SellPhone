import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

/* ======================================================
   USER AUTH MIDDLEWARE (PRODUCTION FINAL)
====================================================== */
const userAuth = async (req, res, next) => {
  try {
    /* ======================================================
       1️⃣ FIREBASE AUTH (PRIMARY – WEB & MOBILE)
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
          id: decoded.uid,
          uid: decoded.uid,
          email: decoded.email,
          role: "user",
          authType: "firebase",
        };

        return next(); 
      } catch (err) {
        console.warn("Firebase auth failed:", err.message);
        // fall through to JWT only if cookie exists
      }
    }

    /* ======================================================
       2️⃣ JWT COOKIE AUTH (FALLBACK ONLY)
    ====================================================== */
    const cookieToken =
      req.cookies?.token ||
      req.cookies?.user_token;

    if (!cookieToken) {
      return res.status(401).json({
        message: "Authentication required (login again)",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Session expired" });
    }

    if (!decoded?.sub || !decoded?.email) {
      return res.status(401).json({ message: "Invalid session token" });
    }

    req.user = {
      id: decoded.sub,
      uid: decoded.sub,
      email: decoded.email,
      role: decoded.role || "user",
      authType: "jwt",
    };

    next();
  } catch (err) {
    console.error("USER AUTH ERROR:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default userAuth;
