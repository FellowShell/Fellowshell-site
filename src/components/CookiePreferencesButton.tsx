import { OPEN_PREFERENCES_EVENT } from "../lib/consent";

export default function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className ?? "link"}
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
    >
      Cookie preferences
    </button>
  );
}
