export const PRICE_RULES = {
  screenCrack: { label: "Screen Crack", amount: 3000 },
  bodyDent: { label: "Body Dent", amount: 1500 },
  speakerFault: { label: "Speaker Fault", amount: 1200 },
  micFault: { label: "Mic Fault", amount: 1000 },
  batteryBelow80: { label: "Battery Health < 80%", amount: 2000 },
  cameraFault: { label: "Camera Fault", amount: 2500 },
};

export const calculateFinalPrice = (expectedPrice, checks) => {
  let deductions = [];
  let totalDeduction = 0;

  Object.entries(checks).forEach(([key, value]) => {
    if (value === false && PRICE_RULES[key]) {
      deductions.push({
        reason: PRICE_RULES[key].label,
        amount: PRICE_RULES[key].amount,
      });
      totalDeduction += PRICE_RULES[key].amount;
    }
  });

  return {
    deductions,
    finalPrice: Math.max(expectedPrice - totalDeduction, 0),
  };
};
