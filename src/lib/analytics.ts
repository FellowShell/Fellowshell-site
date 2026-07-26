import { CONSENT_CHANGED_EVENT, readConsent, type StoredConsent } from "./consent";

/**
 * Nothing is loaded by default. Call `initAnalytics()` once from a
 * client-side entry point (see CookieConsent.tsx). It only fires
 * `loadAnalyticsScript()` once the visitor has actually opted in, and again
 * whenever they change their mind later via "Cookie preferences".
 *
 * There is no analytics vendor wired in yet. When one is chosen, implement
 * `loadAnalyticsScript()` and nothing else in this file needs to change.
 */

let loaded = false;

function loadAnalyticsScript() {
  if (loaded) return;
  loaded = true;
  // Intentionally empty: plug a privacy-respecting analytics snippet here
  // (e.g. Plausible, Fathom, or GA4 with IP anonymisation) once selected.
  // It must only ever be reached through this gated path.
}

function applyConsent(consent: StoredConsent | null) {
  if (consent?.categories.analytics) {
    loadAnalyticsScript();
  }
}

export function initAnalytics() {
  applyConsent(readConsent());
  window.addEventListener(CONSENT_CHANGED_EVENT, (event) => {
    applyConsent((event as CustomEvent<StoredConsent>).detail);
  });
}
