import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  if (!key) {
    if (import.meta.env.DEV) console.warn("[posthog] VITE_POSTHOG_KEY not set — analytics disabled");
    return;
  }
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });
  initialized = true;
}

export { posthog };