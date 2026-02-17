import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

const riderAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.riderToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Rider not authenticated" });
    }

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
    res.status(401).json({ message: "Invalid rider token" });
  }
};

export default riderAuth;
