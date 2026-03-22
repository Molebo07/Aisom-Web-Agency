import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Aisom</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#cards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Card Types</a>
          <a href="#cta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Get Started</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/app/dashboard">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
