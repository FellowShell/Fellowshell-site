/**
 * Central consent model. Nothing in this file talks to a network, it only
 * reads/writes the visitor's local choice so every component (banner,
 * footer "Cookie preferences" link, analytics loader) agrees on one shape.
 */

export const CONSENT_STORAGE_KEY = "fellowshell:consent";
export const CONSENT_VERSION = 1;
export const OPEN_PREFERENCES_EVENT = "fellowshell:open-cookie-preferences";
export const CONSENT_CHANGED_EVENT = "fellowshell:consent-changed";

export interface ConsentCategories {
  /** Strictly necessary storage (e.g. this consent choice itself). Always on. */
  necessary: true;
  /** Analytics / usage measurement. Off until the visitor opts in. */
  analytics: boolean;
}

export interface StoredConsent {
  version: number;
  categories: ConsentCategories;
  decidedAt: string;
}

const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  analytics: false,
};

export function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(categories: Partial<ConsentCategories>): StoredConsent {
  const record: StoredConsent = {
    version: CONSENT_VERSION,
    categories: { ...DEFAULT_CATEGORIES, ...categories, necessary: true },
    decidedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));

  // A lightweight, non-tracking cookie mirrors the choice so it is visible
  // to anyone inspecting cookies and could be read by a future server
  // renderer. It carries no identifier, only the yes/no decision.
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `fellowshell_consent=${record.categories.analytics ? "all" : "necessary"}; max-age=${oneYear}; path=/; SameSite=Lax`;

  window.dispatchEvent(new CustomEvent<StoredConsent>(CONSENT_CHANGED_EVENT, { detail: record }));
  return record;
}

export function acceptAll(): StoredConsent {
  return writeConsent({ analytics: true });
}

export function rejectNonEssential(): StoredConsent {
  return writeConsent({ analytics: false });
}
