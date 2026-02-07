import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

/* ======================================================
   ADMIN AUTH (MONGO + JWT ONLY)
====================================================== */
const adminAuth = async (req, res, next) => {
  try {
    // ✅ ADMIN TOKEN FROM COOKIE ONLY
    const token =
      req.cookies?.adminToken ||
      req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ message: "Admin login required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Admin session expired" });
    }

    // 🔒 Enforce admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("❌ ADMIN AUTH ERROR:", error);
    return res.status(401).json({ message: "Unauthorized admin" });
  }
};

export default adminAuth;
