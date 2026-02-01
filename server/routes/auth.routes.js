import express from "express";
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ======================================================
   FIREBASE LOGIN → BACKEND SESSION
====================================================== */
router.post("/firebase-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    /* -------- STRICT INPUT VALIDATION -------- */
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({
        message: "Invalid or missing Firebase token",
      });
    }

    /* -------- VERIFY FIREBASE TOKEN -------- */
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded?.uid || !decoded?.email) {
      return res.status(401).json({
        message: "Invalid Firebase token payload",
      });
    }

    /* -------- CREATE BACKEND JWT -------- */
    const sessionToken = jwt.sign(
      {
        sub: decoded.uid,          // subject
        email: decoded.email,
        provider: "firebase",
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "sellphone-api",
      }
    );

    /* -------- COOKIE OPTIONS (PRODUCTION SAFE) -------- */
    res.cookie("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("FIREBASE LOGIN ERROR:", error.message);

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
});

export default router;
