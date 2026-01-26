import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("USER AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default userAuth;
