import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPostHog } from "./integrations/posthog/client";

initPostHog();

createRoot(document.getElementById("root")!).render(<App />);
