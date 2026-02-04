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
        inventoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
          required: false,
        },

        phone: {
          type: Object,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
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
      type: String,
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

    /* ================= STATUS HISTORY ================= */
    statusHistory: [
      {
        status: String,
        changedBy: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= INVOICE ================= */
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },

    invoiceNumber: {
      type: String,
    },

    invoiceUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
