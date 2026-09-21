import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BrainProvider } from "./lib/store";
import "./index.css";

/*
 * Static-host SPA fallback.
 *
 * `public/404.html` sends unknown paths to /index.html?p=<original path>. Here
 * we put that path back into the address bar *before* the router mounts, so a
 * refresh on /app/memory lands on the memory screen instead of the landing page.
 * This must stay above createRoot().
 */
(function restoreDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("p");
  if (!target || !target.startsWith("/")) return;
  window.history.replaceState(null, "", target);
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <BrainProvider>
        <App />
      </BrainProvider>
    </BrowserRouter>
  </StrictMode>,
);
