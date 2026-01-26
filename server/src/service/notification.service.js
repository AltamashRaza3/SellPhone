/**
 * Notification Service
 * ====================
 * Central place to send user notifications.
 * Replace console.log with real SMS / WhatsApp later.
 */

export const notifyUser = async ({
  user,
  type,
  payload = {},
}) => {
  try {
    switch (type) {
      case "FINAL_PRICE_READY":
        console.log(
          `[NOTIFY] Final price ready for user ${user.uid}`
        );
        break;

      case "PRICE_ACCEPTED":
        console.log(
          `[NOTIFY] User accepted final price ${user.uid}`
        );
        break;

      case "PRICE_REJECTED":
        console.log(
          `[NOTIFY] User rejected final price ${user.uid}`
        );
        break;

      case "PICKUP_COMPLETED":
        console.log(
          `[NOTIFY] Pickup completed for user ${user.uid}`
        );
        break;

      default:
        console.log(
          `[NOTIFY] Unknown notification type`
        );
    }
  } catch (error) {
    console.error(
      "NOTIFICATION ERROR:",
      error
    );
  }
};
