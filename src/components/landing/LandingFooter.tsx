import { Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="py-12 bg-primary border-t border-primary-foreground/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-foreground">
              <Terminal className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary-foreground">Aisom</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-primary-foreground/50">
            <Link to="/auth/login" className="hover:text-primary-foreground transition-colors">Log in</Link>
            <a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary-foreground transition-colors">FAQ</a>
          </div>
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Aisom. Built for how developers think.
          </p>
        </div>
      </div>
    </footer>
  );
}
