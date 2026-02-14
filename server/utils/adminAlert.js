import AdminAlert from "../models/AdminAlert.js";

export const createAdminAlert = async ({
  sellRequestId,
  message,
  type = "pickup_rejected",
  severity = "medium",
}) => {
  try {
    await AdminAlert.create({
      type,
      sellRequestId,
      message,
      severity,
    });
  } catch (error) {
    console.error("ADMIN ALERT ERROR:", error);
  }
};


