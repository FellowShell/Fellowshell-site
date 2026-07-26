import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/services", label: "For companies" },
  { href: "/volunteers", label: "For volunteers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === currentPath || (href !== "/" && currentPath.startsWith(href));

  return (
    <div className="site-header__inner">
      <a href="/" className="site-header__logo">
        Fellowshell
      </a>

      <button
        type="button"
        className="site-header__toggle"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        <span className="site-header__toggle-icon" aria-hidden="true" data-open={open} />
      </button>

      <nav
        id="primary-nav"
        aria-label="Primary"
        className="site-nav"
        data-open={open}
      >
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
