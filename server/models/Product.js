import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    storage: {
      type: String,
      required: true,
    },

    condition: {
      type: String,
      required: true,
      enum: ["Like New", "Excellent", "Good", "Fair"],
    },

    color: {
      type: String,
      default: "",
    },

    ram: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/300x400?text=No+Image",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    inventoryItemId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "InventoryItem",
     unique: true,
     sparse: true, // allows old products without inventory
},

  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
