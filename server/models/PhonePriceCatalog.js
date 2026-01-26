import mongoose from "mongoose";

const phonePriceCatalogSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    storage: {
      type: String,
      required: true,
      trim: true,
    },

    ram: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Market price of the device in EXCELLENT condition
     * for the current year (no defects).
     */
    baseMarketPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Depreciation applied per year of device age
     * Example: 0.10 = 10% per year
     */
    depreciationPerYear: {
      type: Number,
      default: 0.10,
      min: 0,
      max: 0.3,
    },

    /**
     * Maximum depreciation allowed (to avoid negative prices)
     * Example: 0.6 = max 60% depreciation
     */
    maxDepreciation: {
      type: Number,
      default: 0.6,
      min: 0,
      max: 0.9,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Ensure one unique price entry per device variant
 */
phonePriceCatalogSchema.index(
  { brand: 1, model: 1, storage: 1, ram: 1 },
  { unique: true }
);

export default mongoose.model(
  "PhonePriceCatalog",
  phonePriceCatalogSchema
);
