import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

/* ======================================================
   USER AUTH MIDDLEWARE (FINAL)
====================================================== */
const userAuth = async (req, res, next) => {
  try {
    /* ======================================================
       1️⃣ FIREBASE AUTH (PRIMARY)
    ====================================================== */
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const firebaseToken = authHeader.split(" ")[1];

      try {
        const decoded = await admin.auth().verifyIdToken(firebaseToken);

        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          role: "user",
          authType: "firebase",
        };

        return next(); // ✅ STOP HERE
      } catch (err) {
        console.warn("Firebase auth failed:", err.message);
        // DO NOT FALL THROUGH AUTOMATICALLY
      }
    }

    /* ======================================================
       2️⃣ JWT COOKIE AUTH (OPTIONAL)
    ====================================================== */
    const cookieToken =
      req.cookies?.token ||
      req.cookies?.user_token;

    if (!cookieToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);

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
