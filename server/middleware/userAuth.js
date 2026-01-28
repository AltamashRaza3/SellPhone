import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

const userAuth = async (req, res, next) => {
  try {
    // 1️⃣ Try Firebase token
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          authType: "firebase",
        };
        return next();
      } catch {
        // continue to JWT
      }
    }

    // 2️⃣ Fallback to JWT cookie
    const cookieToken = req.cookies?.token;
    if (!cookieToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      authType: "jwt",
    };

    next();
  } catch (err) {
    console.error("USER AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default userAuth;
