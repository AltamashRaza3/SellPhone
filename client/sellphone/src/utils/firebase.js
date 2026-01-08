
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDvzAIMb4m7gj38e7KdtPeZsuPfAHeNoV8",
  authDomain: "salephone-cf695.firebaseapp.com",
  projectId: "salephone-cf695",
  storageBucket: "salephone-cf695.firebasestorage.app",
  messagingSenderId: "1096112512954",
  appId: "1:1096112512954:web:cedf24963f50f058658783",
  measurementId: "G-H2LVNSJ0M6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
const analytics = getAnalytics(app);