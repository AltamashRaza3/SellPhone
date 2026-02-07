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

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin", // ✅ REQUIRED
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};


/* ================= ADMIN LOGOUT ================= */
export const adminLogout = (req, res) => {
  res.clearCookie("admin_token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
  res.json({ message: "Admin logged out successfully" });
};

/* ================= ADMIN SESSION ================= */
export const adminMe = (req, res) => {
  res.json({
    id: req.admin._id,
    email: req.admin.email,
  });
};
