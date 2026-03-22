import { Terminal } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Terminal className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Aisom</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The knowledge system built for how developers think.
          </p>
        </div>
      </div>
    </footer>
  );
}
