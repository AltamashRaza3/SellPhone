import admin from "firebase-admin";
import serviceAccount from "./firebaseServiceAccount.js";

/* ================= INIT FIREBASE ADMIN ================= */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
