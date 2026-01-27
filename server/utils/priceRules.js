/**
 * PRICE ENGINE – PRODUCTION SINGLE SOURCE OF TRUTH
 * ================================================
 * - User NEVER sets price
 * - Admin NEVER negotiates price
 * - Rider NEVER enters arbitrary price
 * - System calculates everything deterministically
 */

/* ======================================================
   BASE MARKET PRICE CATALOG
   (Temporary in-code catalog → later move to DB)
====================================================== */

/**
 * Average resale market prices (₹) by brand
 * Conservative values to avoid overpricing
 */
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

/**
 * Fallback base price if brand is unknown
 */
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

const MIN_BASE_PRICE = 1000;   // never quote absurd values
const MIN_FINAL_PRICE = 500;   // absolute payout floor
const MAX_DEPRECIATION = 0.7;  // system never depreciates more than 70%

/* ======================================================
   CALCULATE BASE PRICE (SYSTEM GENERATED)
====================================================== */

/**
 * Base Price = Market Price × Age Depreciation × Condition
 *
 * @param {Object} params
 * @param {string} params.brand
 * @param {number} params.purchaseYear
 * @param {string} params.declaredCondition
 */
export const calculateBasePrice = ({
  brand,
  purchaseYear,
  declaredCondition,
}) => {
  const currentYear = new Date().getFullYear();

  /* ---------- MARKET PRICE ---------- */
  const baseMarketPrice =
    BRAND_BASE_PRICE[brand] ?? DEFAULT_BASE_PRICE;

  /* ---------- SAFE AGE CALCULATION ---------- */
  const safePurchaseYear =
    typeof purchaseYear === "number" && purchaseYear > 2000
      ? purchaseYear
      : currentYear;

  const age = Math.max(currentYear - safePurchaseYear, 0);

  /* ---------- AGE DEPRECIATION ---------- */
  const depreciationPerYear = 0.12; // 12% per year
  let depreciation = age * depreciationPerYear;
  depreciation = Math.min(depreciation, MAX_DEPRECIATION);

  let priceAfterAge =
    baseMarketPrice * (1 - depreciation);

  /* ---------- CONDITION MULTIPLIER ---------- */
  const conditionMultiplier =
    CONDITION_MULTIPLIER[declaredCondition] ?? 0.8;

  let basePrice =
    priceAfterAge * conditionMultiplier;

  /* ---------- SANITY CLAMPS ---------- */
  basePrice = Math.round(basePrice);

  if (basePrice < MIN_BASE_PRICE) {
    basePrice = MIN_BASE_PRICE;
  }

  return basePrice;
};

/* ======================================================
   RIDER VERIFICATION RULES (DEDUCTIONS)
====================================================== */

export const PRICE_RULES = {
  screenCrack: {
    label: "Screen Crack",
    amount: 3000,
  },
  bodyDent: {
    label: "Body Dent",
    amount: 1500,
  },
  speakerFault: {
    label: "Speaker Fault",
    amount: 1200,
  },
  micFault: {
    label: "Mic Fault",
    amount: 1000,
  },
  batteryBelow80: {
    label: "Battery Health < 80%",
    amount: 2000,
  },
  cameraFault: {
    label: "Camera Fault",
    amount: 2500,
  },
};

/* ======================================================
   FINAL PRICE AFTER VERIFICATION
====================================================== */

/**
 * Final Price = Base Price − Verified Deductions
 *
 * @param {number} basePrice
 * @param {Object} checks (boolean flags from rider)
 */
export const calculateFinalPrice = (
  basePrice,
  checks = {}
) => {
  let deductions = [];
  let totalDeduction = 0;

  Object.entries(checks).forEach(([key, value]) => {
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

  /* ---------- PRICE FLOOR ---------- */
  if (finalPrice < MIN_FINAL_PRICE) {
    deductions.push({
      reason: "Minimum price floor applied",
      amount:
        finalPrice < 0
          ? basePrice
          : finalPrice - MIN_FINAL_PRICE,
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
