import { useEffect, useRef, useState } from "react";
import {
  OPEN_PREFERENCES_EVENT,
  acceptAll,
  readConsent,
  rejectNonEssential,
  writeConsent,
} from "../lib/consent";

type View = "hidden" | "banner" | "manage";

export default function CookieConsent() {
  const [view, setView] = useState<View>("hidden");
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const existing = readConsent();
    setView(existing ? "hidden" : "banner");
    if (existing) setAnalyticsChecked(existing.categories.analytics);

    const openPreferences = () => {
      const current = readConsent();
      setAnalyticsChecked(current?.categories.analytics ?? false);
      setView("manage");
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    // Only steal focus when the visitor explicitly asked to manage
    // preferences (footer link, or "Manage preferences" in the banner).
    // The first automatic appearance on load shouldn't grab keyboard focus.
    // It's still announced via the region landmark for screen reader users.
    if (view === "manage") headingRef.current?.focus();
  }, [view]);

  if (view === "hidden") return null;

  const isManaging = view === "manage";

  return (
    <div className="cookie-consent" role="region" aria-label="Cookie consent">
      <div className="cookie-consent__panel">
        <h2
          className="cookie-consent__title"
          ref={headingRef}
          tabIndex={-1}
        >
          {isManaging ? "Cookie preferences" : "We respect your privacy"}
        </h2>

        <p className="cookie-consent__copy">
          We use strictly necessary storage to run this site, and optional
          analytics cookies to understand how it's used, only if you allow
          it. Nothing beyond what's necessary is set until you choose. See our{" "}
          <a className="link" href="/cookie-policy">
            Cookie Policy
          </a>{" "}
          and{" "}
          <a className="link" href="/privacy-policy">
            Privacy Policy
          </a>
          .
        </p>

        {isManaging && (
          <fieldset className="cookie-consent__options">
            <legend className="visually-hidden">Cookie categories</legend>

            <div className="cookie-consent__option">
              <div>
                <p className="cookie-consent__option-title">
                  Strictly necessary
                </p>
                <p className="hint">
                  Required for the site to function, such as remembering this
                  choice. Cannot be turned off.
                </p>
              </div>
              <input type="checkbox" checked disabled aria-label="Strictly necessary cookies (always on)" />
            </div>

            <div className="cookie-consent__option">
              <div>
                <label className="cookie-consent__option-title" htmlFor="analytics-toggle">
                  Analytics
                </label>
                <p className="hint">
                  Helps us understand aggregate site usage. No data is
                  collected until you turn this on.
                </p>
              </div>
              <input
                id="analytics-toggle"
                type="checkbox"
                checked={analyticsChecked}
                onChange={(event) => setAnalyticsChecked(event.target.checked)}
              />
            </div>
          </fieldset>
        )}

        <div className="cookie-consent__actions">
          {isManaging ? (
            <>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  writeConsent({ analytics: analyticsChecked });
                  setView("hidden");
                }}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  acceptAll();
                  setView("hidden");
                }}
              >
                Accept all
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  acceptAll();
                  setView("hidden");
                }}
              >
                Accept all
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  rejectNonEssential();
                  setView("hidden");
                }}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setView("manage")}
              >
                Manage preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
