import SellRequest from "../models/SellRequest.js";

/**
 * CREATE SELL REQUEST (USER)
 */
export const createSellRequest = async (req, res) => {
  try {
    const { phone, expectedPrice, contact } = req.body;

    if (!phone?.brand || !phone?.model || !expectedPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sellRequest = await SellRequest.create({
      user: {
        uid: req.user.uid,
        email: req.user.email,
      },
      phone,
      expectedPrice,
      contact: {
        phone: contact?.phone || null,
      },
      statusHistory: [
        {
          status: "Pending",
          changedBy: "system",
          note: "Sell request created",
        },
      ],
    });

    res.status(201).json(sellRequest);
  } catch (err) {
    console.error("SELL REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to submit sell request" });
  }
};

/**
 * GET MY SELL REQUESTS (USER)
 */
export const getMySellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find({
      "user.uid": req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to load sell requests" });
  }
};
