import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-24 md:py-32 bg-primary">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary-foreground text-balance mb-4">
          Stop re-solving solved problems
        </h2>
        <p className="text-primary-foreground/60 max-w-md mx-auto mb-8 text-pretty">
          Join developers who have turned their debugging history into a searchable superpower.
        </p>
        <Button
          variant="secondary"
          className="h-12 px-8 text-base font-semibold rounded-xl"
          asChild
        >
          <Link to="/auth/signup">
            Get started free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
