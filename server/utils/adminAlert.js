import AdminAlert from "../models/AdminAlert.js";

export const createAdminAlert = async ({
  sellRequestId,
  message,
  type = "pickup_rejected",
}) => {
  await AdminAlert.create({
    type,
    sellRequestId,
    message,
  });
};
