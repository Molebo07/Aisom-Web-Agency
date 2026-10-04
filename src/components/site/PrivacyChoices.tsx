import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { disablePostHog, initPostHog } from "@/integrations/posthog/client";

const STORAGE_KEY = "aisom-analytics-consent";
const OPEN_EVENT = "aisom:open-privacy-choices";

type Choice = "accepted" | "rejected" | null;

export function PrivacyChoices() {
  const [choice, setChoice] = useState<Choice>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "accepted" || stored === "rejected" ? stored : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (choice === "accepted") initPostHog();
    if (choice === "rejected") disablePostHog();
  }, [choice]);

  useEffect(() => {
    const open = () => setChoice(null);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  function save(value: Exclude<Choice, null>) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Keep the choice for this page view if storage is unavailable.
    }
    setChoice(value);
  }

  if (choice !== null) return null;

  return (
    <aside
      aria-label="Privacy choices"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background shadow-[0_-12px_40px_rgba(11,18,32,0.16)]"
    >
      <div className="wrap flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[14px] font-medium text-slate">Your privacy choices</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ash">
            Optional analytics help us understand site use. They stay off unless you allow them.
            Read the <a href="/privacy-policy" className="underline">privacy policy</a> or change this choice later in the footer.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => save("rejected")}>Reject optional</Button>
          <Button onClick={() => save("accepted")}>Allow analytics</Button>
        </div>
      </div>
    </aside>
  );
}
