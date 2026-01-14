import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

/* ================= JWT ================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ================= ADMIN LOGIN ================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id);

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Admin login successful",
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= ADMIN LOGOUT ================= */
export const adminLogout = (req, res) => {
  res.clearCookie("admin_token");
  res.json({ message: "Admin logged out successfully" });
};

/* ================= ADMIN ME (SESSION VERIFY) ================= */
export const adminMe = async (req, res) => {
  try {
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    res.json({
      id: admin._id,
      email: admin.email,
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
