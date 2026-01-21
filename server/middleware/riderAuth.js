import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

const riderAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "rider") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const rider = await Rider.findById(decoded.riderId);
    if (!rider || rider.status !== "active") {
      return res.status(401).json({ message: "Invalid rider" });
    }

    req.rider = {
      riderId: rider._id.toString(),
      name: rider.name,
      phone: rider.phone,
    };

    next();
  } catch (err) {
    console.error("RIDER AUTH ERROR:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default riderAuth;
