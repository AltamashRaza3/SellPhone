/**
 * PRICE RULES – SINGLE SOURCE OF TRUTH
 * ===================================
 * - User NEVER sets price
 * - Admin NEVER negotiates price
 * - Rider NEVER enters price
 * - System calculates everything
 */

/* ======================================================
   PRICE CATALOG → BASE PRICE
====================================================== */

/**
 * Declared condition multiplier (user input)
 */
export const CONDITION_MULTIPLIER = {
  Excellent: 1.0,
  Good: 0.9,
  Fair: 0.8,
};

/**
 * Calculate system base price
 * (Market + Age + Declared Condition)
 */
export const calculateBasePrice = ({
  catalog,
  purchaseYear,
  declaredCondition,
}) => {
  if (!catalog) {
    throw new Error("Price catalog not found");
  }

  const {
    baseMarketPrice,
    depreciationPerYear = 0.1,
    maxDepreciation = 0.6,
  } = catalog;

  const currentYear = new Date().getFullYear();

  const safePurchaseYear =
    typeof purchaseYear === "number"
      ? purchaseYear
      : currentYear;

  const age = Math.max(currentYear - safePurchaseYear, 0);

  /* ================= AGE DEPRECIATION ================= */
  let depreciation = age * depreciationPerYear;
  if (depreciation > maxDepreciation) {
    depreciation = maxDepreciation;
  }

  let priceAfterAge =
    baseMarketPrice * (1 - depreciation);

  /* ================= CONDITION MULTIPLIER ================= */
  const conditionMultiplier =
    CONDITION_MULTIPLIER[declaredCondition] ?? 0.8;

  let basePrice =
    priceAfterAge * conditionMultiplier;

  basePrice = Math.round(basePrice);
  return Math.max(basePrice, 0);
};

/* ======================================================
   RIDER VERIFICATION → ₹ BASED DEDUCTIONS
====================================================== */

export const PRICE_RULES = {
  screenCrack: { label: "Screen Crack", amount: 3000 },
  bodyDent: { label: "Body Dent", amount: 1500 },
  speakerFault: { label: "Speaker Fault", amount: 1200 },
  micFault: { label: "Mic Fault", amount: 1000 },
  batteryBelow80: { label: "Battery Health < 80%", amount: 2000 },
  cameraFault: { label: "Camera Fault", amount: 2500 },
};

const MIN_FINAL_PRICE = 500; // 🔐 price floor

/**
 * Calculate final price after rider verification
 *
 * @param {number} basePrice (SYSTEM GENERATED)
 * @param {Object} checks (RIDER INPUT)
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

      deductions.push({ reason: label, amount });
      totalDeduction += amount;
    }
  });

  let finalPrice = basePrice - totalDeduction;

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
