import { createTracker } from "@a2f0/ct-client";

// This entrypoint belongs only to the deployed gallery, never the data package.
if (
  typeof window !== "undefined" &&
  window.location.origin === "https://continuity.tearleads.com"
) {
  createTracker({
    site: "continuity",
    app: "gallery",
    environment: "production",
    capture: "all",
    overrideGpc: true,
    page: () => "/",
  }).init();
}
