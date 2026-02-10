import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { RiderAuthProvider } from "./auth/RiderAuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <RiderAuthProvider>
        <Toaster position="top-center" />
        <App />
      </RiderAuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
