/**
 * PRICE ENGINE – SINGLE SOURCE OF TRUTH (PRODUCTION)
 * ==================================================
 * ✔ User NEVER sets price
 * ✔ Admin NEVER negotiates price
 * ✔ Rider NEVER enters arbitrary price
 * ✔ System calculates everything deterministically
 */

/* ======================================================
   BASE MARKET PRICE CATALOG
   (Temporary in-code catalog → later move to DB)
====================================================== */

export const BRAND_BASE_PRICE = {
  Apple: 35000,
  Samsung: 26000,
  Google: 28000,
  OnePlus: 24000,
  Xiaomi: 18000,
  Realme: 16000,
  Oppo: 17000,
  Vivo: 17000,
  Motorola: 16000,
};

const DEFAULT_BASE_PRICE = 15000;

/* ======================================================
   CONDITION MULTIPLIERS (USER DECLARED)
====================================================== */

export const CONDITION_MULTIPLIER = {
  Excellent: 1.0,
  Good: 0.9,
  Fair: 0.8,
};

/* ======================================================
   SYSTEM LIMITS (GUARDS)
====================================================== */

const MIN_BASE_PRICE = 1000;
const MIN_FINAL_PRICE = 500;
const MAX_DEPRECIATION = 0.7;

/* ======================================================
   CALCULATE BASE PRICE (SYSTEM GENERATED)
====================================================== */

export const calculateBasePrice = ({
  brand,
  purchaseYear,
  declaredCondition,
}) => {
  const currentYear = new Date().getFullYear();

  const marketPrice =
    BRAND_BASE_PRICE[brand] ?? DEFAULT_BASE_PRICE;

  const safePurchaseYear =
    typeof purchaseYear === "number" && purchaseYear > 2000
      ? purchaseYear
      : currentYear;

  const age = Math.max(currentYear - safePurchaseYear, 0);

  const depreciationPerYear = 0.12; // 12% per year
  let depreciation = Math.min(
    age * depreciationPerYear,
    MAX_DEPRECIATION
  );

  let priceAfterAge =
    marketPrice * (1 - depreciation);

  const conditionMultiplier =
    CONDITION_MULTIPLIER[declaredCondition] ?? 0.8;

  let basePrice =
    priceAfterAge * conditionMultiplier;

  basePrice = Math.round(basePrice);

  if (basePrice < MIN_BASE_PRICE) {
    basePrice = MIN_BASE_PRICE;
  }

  return basePrice;
};

/* ======================================================
   RIDER VERIFICATION RULES (GOOD STATE KEYS)
====================================================== */
/**
 * IMPORTANT:
 * true  → condition is GOOD
 * false → condition FAILED → deduction applied
 */

export const PRICE_RULES = {
  screenIntact: {
    label: "Screen damaged",
    amount: 3000,
  },
  noBodyDent: {
    label: "Body dents present",
    amount: 1500,
  },
  speakerWorking: {
    label: "Speaker faulty",
    amount: 1200,
  },
  micWorking: {
    label: "Microphone faulty",
    amount: 1000,
  },
  batteryAbove80: {
    label: "Battery health below 80%",
    amount: 2000,
  },
  cameraWorking: {
    label: "Camera faulty",
    amount: 2500,
  },
};

/* ======================================================
   FINAL PRICE AFTER VERIFICATION
====================================================== */

export const calculateFinalPrice = (basePrice, checks = {}) => {
  let deductions = [];
  let totalDeduction = 0;

  Object.entries(checks).forEach(([key, value]) => {
    // ❌ Deduct ONLY when condition is NOT met
    if (value === false && PRICE_RULES[key]) {
      const { label, amount } = PRICE_RULES[key];

      deductions.push({
        reason: label,
        amount,
      });

      totalDeduction += amount;
    }
  });

  let finalPrice = basePrice - totalDeduction;

  if (finalPrice < MIN_FINAL_PRICE) {
    deductions.push({
      reason: "Minimum price floor applied",
      amount: Math.max(basePrice - MIN_FINAL_PRICE, 0),
    });

    finalPrice = MIN_FINAL_PRICE;
  }

  return {
    basePrice,
    deductions,
    totalDeduction,
    finalPrice,
  };
};
