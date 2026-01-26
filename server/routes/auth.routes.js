import express from "express";
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/firebase-login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Token missing" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const token = jwt.sign(
      { uid: decoded.uid, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,   // localhost
      sameSite: "lax",
      path: "/",
    });

    res.json({ success: true });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
