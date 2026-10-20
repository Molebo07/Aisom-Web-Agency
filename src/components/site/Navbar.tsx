import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/services", label: "Services" },
  { to: "/work", label: "Work" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    setOpen(false);
    setOverDark(false);
    const sections = document.querySelectorAll<HTMLElement>("[data-theme]");
    if (!sections.length) return;

    const updateTheme = () => {
      const headerOffset = 68;
      const activeSection = Array.from(sections).find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= headerOffset && bounds.bottom > headerOffset;
      });
      setOverDark(activeSection?.dataset.theme === "dark");
    };

    const observer = new IntersectionObserver(updateTheme, {
      rootMargin: "-68px 0px -75% 0px",
      threshold: 0,
    });
    sections.forEach((section) => observer.observe(section));
    updateTheme();
    window.addEventListener("scroll", updateTheme, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateTheme);
    };
  }, [location.pathname]);

  const dark = overDark;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        dark && "dark-section",
        dark
          ? "border-white/10 bg-[#0A111F]/80 text-white backdrop-blur-md"
          : "border-border bg-white/90 text-slate backdrop-blur-md",
      )}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <Link to="/" aria-label="Aisom home" className="flex items-center">
          <Logo dark={dark} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative inline-flex min-h-11 items-center text-[13px] transition-colors after:absolute after:-bottom-2 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2 after:bg-accent-blue after:transition-all hover:text-accent-blue hover:after:w-full",
                  dark ? "text-white/75 hover:text-white" : "text-ash hover:text-slate",
                  isActive && (dark ? "font-semibold text-white" : "font-semibold text-slate"),
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="min-h-11 text-[13px]">
            <Link to="/quote">Get a quote</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="secondary" size="icon" aria-label="Open menu" className={`h-11 w-11 ${dark ? "bg-white/10 text-white hover:bg-white/20" : ""}`}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav aria-label="Mobile" className="mt-10 flex flex-col gap-1">
                {links.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      className={cn(
                        "rounded-md px-2 py-3 text-[15px] text-ash hover:bg-muted hover:text-slate",
                        location.pathname === link.to && "font-medium text-slate",
                      )}
                      aria-current={location.pathname === link.to ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link to="/quote" className="mt-3 flex min-h-11 items-center rounded-md bg-primary px-3 py-3 text-[15px] font-medium text-white">
                    Get a quote
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
