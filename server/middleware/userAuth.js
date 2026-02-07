import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

const userAuth = async (req, res, next) => {
  try {
    /* ======================================================
       1️⃣ FIREBASE AUTH (PRIMARY – REQUIRED)
    ====================================================== */
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const firebaseToken = authHeader.split(" ")[1];

      try {
        const decoded = await admin.auth().verifyIdToken(firebaseToken);

        req.user = {
          id: decoded.uid,
          uid: decoded.uid,
          email: decoded.email,
          role: "user",
          authType: "firebase",
        };

        return next(); // ✅ STOP HERE
      } catch (err) {
        console.error("Firebase token invalid:", err.message);
        return res.status(401).json({ message: "Invalid Firebase token" });
      }
    }

    /* ======================================================
       2️⃣ JWT COOKIE AUTH (OPTIONAL FALLBACK)
    ====================================================== */
    const cookieToken =
      req.cookies?.token ||
      req.cookies?.user_token;

    if (!cookieToken) {
      return res.status(401).json({
        message: "Authentication required (login again)",
      });
    }

    const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);

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
