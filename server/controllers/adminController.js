import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

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

    const token = generateToken(admin);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
