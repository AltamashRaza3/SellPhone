import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      uid: {
        type: String,
        required: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    /* ================= ITEMS ================= */
    items: [
      {
        phone: {
          type: Object, // snapshot of phone at purchase time
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    /* ================= AMOUNT ================= */
    totalAmount: {
      type: Number,
      required: true,
    },

    /* ================= SHIPPING ================= */
    shippingAddress: {
      type: String, // stored as formatted string
      required: true,
    },

    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentId: String,

    /* ================= ORDER STATUS ================= */
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,

    /* ================= STATUS HISTORY (PHASE 15.3) ================= */
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: String, // "admin" | "user"
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
