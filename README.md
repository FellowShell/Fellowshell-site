# Fellowshell

A consulting and talent pipeline marketing site: Astro + React (TSX islands), TypeScript throughout.
Fellowshell recruits, trains, and manages unpaid volunteers who do real work for client companies.

## Stack

- **Astro** for pages/layout (static output).
- **React (.tsx)** for interactive islands: `SiteNav`, `CookieConsent`, `CookiePreferencesButton`, `ContactForm`.
- Self-hosted fonts via `@fontsource` (no third-party font CDN, which avoids sending visitor IPs to Google before consent).

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run check    # type-check .astro and .tsx files
```

## Design system

Everything lives in `src/styles/tokens.css` (values) and `src/styles/global.css`
(base styles + component classes). It follows the brief this was built from:

- **Colour, 60/30/10 plus 2 greys.** `--color-bg` (60%, dominant neutral),
  `--color-surface` (30%, cards/alt sections/border source), `--color-accent`
  (10%, **reserved for CTAs only**, never decoration), plus `--color-text`
  (full) and `--color-text-muted`. Status colours (`success`/`danger`/`warning`)
  are an explicit exception, used only for colour-coded action buttons where
  the colour itself is the meaning (e.g. a destructive action).
- **Type, 2 fonts, fixed ratio.** `Fraunces` (display/headings) plus `Manrope`
  (body), on a 1.25 (major third) modular scale from a 16px base.
- **Space, 8pt grid.** `--space-0-5` through `--space-8`, plus a
  `--clear-space` token that sets the minimum breathing room around
  interactive elements.
- Accessibility baked into the tokens: a visible `:focus-visible` ring,
  `prefers-reduced-motion` support, and colour pairs verified against WCAG AA
  contrast (see the notes in `tokens.css`).

## GDPR and cookie consent

- `src/lib/consent.ts` is the single source of truth for the consent state
  (`localStorage` plus a non-identifying mirror cookie). Nothing beyond
  strictly necessary storage is set before a choice is made.
- `src/components/CookieConsent.tsx` renders the banner (Accept all / Reject
  non-essential / Manage preferences) and is reopenable anytime via the
  "Cookie preferences" link in the footer.
- `src/lib/analytics.ts` only fires `loadAnalyticsScript()` if
  `categories.analytics === true`. **No analytics vendor is wired in yet**,
  that function is intentionally empty. Add your chosen tool there and
  nothing else needs to change.
- `/privacy-policy`, `/cookie-policy`, and `/terms` are drafted to match what
  the code actually does. Have them reviewed by a lawyer for your
  jurisdiction before publishing.

## Contact form

`src/components/ContactForm.tsx` posts directly to [FormSubmit](https://formsubmit.co)
(`src/lib/contact.ts`), which forwards submissions, including any attached
file, to `hello@fellowshell.com` by email. No hosting or backend is required.

- **Activation step**: the first real submission triggers a one-time
  confirmation email from FormSubmit to `hello@fellowshell.com`. Someone
  needs to click that link before submissions start arriving for real. Send
  a test message once the site is live and check that inbox.
- File attachments are capped at 10MB total per submission client-side, to
  match FormSubmit's free-tier limit.
- Spam protection uses a hidden honeypot field (`_honeypot`) rather than a
  visible captcha, so the in-page submit flow stays uninterrupted.
- FormSubmit is disclosed as a data processor in `/privacy-policy`.

## Before this goes live

Search the codebase for `[` bracket placeholders. Every one is a spot that
needs a real value:

- Illustrative stats on the homepage (`src/pages/index.astro`)
- The homepage testimonial placeholder, replace or remove it
- `/about` leadership section (a first name and a line of background is
  enough; the legal name is intentionally kept off the public site)
- An analytics vendor in `src/lib/analytics.ts`, if you want one
- The jurisdiction/governing-law line in `/terms`
- Legal review of `/privacy-policy`, `/cookie-policy`, and `/terms`, and of
  the volunteer program structure itself: unpaid people doing real work for
  client companies can trigger minimum-wage/labour-law obligations in a lot
  of places depending on how the arrangement is structured, so this is worth
  a real legal check before launch, not just the privacy paperwork
