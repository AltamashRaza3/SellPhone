import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

const riderAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Rider not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 STRICT ROLE CHECK
    if (decoded.role !== "rider") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 🔥 decoded.riderId MUST BE Rider._id
    const rider = await Rider.findById(decoded.riderId);
    if (!rider || rider.status !== "active") {
      return res.status(401).json({ message: "Invalid rider" });
    }

    req.rider = {
      riderId: rider._id, 
      name: rider.name,
      phone: rider.phone,
    };

    next();
  } catch (err) {
    console.error("RIDER AUTH ERROR:", err);
    res.status(401).json({ message: "Invalid rider token" });
  }
};

export default riderAuth;
