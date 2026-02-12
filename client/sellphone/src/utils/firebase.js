import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCtJakCbYPt6sYqUvJzdSwfnpeDtiOJyqw",
  authDomain: "salephone-cf695.firebaseapp.com",
  projectId: "salephone-cf695",

  // ✅ CORRECT BUCKET (DO NOT CHANGE)
  storageBucket: "salephone-cf695.appspot.com",

  messagingSenderId: "1096112512954",
  appId: "1:1096112512954:web:cedf24963f50f058658783",
  measurementId: "G-H2LVNSJ0M6",
};

const app = initializeApp(firebaseConfig);

/* ✅ SERVICES */
export const auth = getAuth(app);
export const storage = getStorage(app);

/* ⚠️ Analytics disabled on localhost (prevents timing issues) */
export let analytics;
if (
  typeof window !== "undefined" &&
  window.location &&
  window.location.hostname !== "localhost"
) {
  analytics = getAnalytics(app);
}

