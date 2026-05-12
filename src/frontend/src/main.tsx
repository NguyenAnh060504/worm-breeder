import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <InternetIdentityProvider>
    <App />
  </InternetIdentityProvider>,
);
