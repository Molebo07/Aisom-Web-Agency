import { useState } from "react";
import { processSteps } from "@/data/site";
import { track } from "@/lib/analytics";

type Package = "starter" | "business";

const schedules: Record<Package, { label: string; timeline: string }> = {
  starter: { label: "Starter", timeline: "Live in 1 to 2 weeks" },
  business: { label: "Business", timeline: "Live in 2 to 4 weeks" },
};

const durations: Record<Package, string[]> = {
  starter: ["1 day", "2–3 days", "3–5 days", "2 days", "1 day"],
  business: ["2–3 days", "3–5 days", "5–10 days", "2–3 days", "1 day"],
};

export function ProcessTimeline({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Package>("business");
  const activeSchedule = schedules[selected];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-white/70">Choose a package to see its expected overall timeline.</p>
        <div className="inline-flex rounded-sm border border-white/15 p-1" aria-label="Choose a package timeline">
          {(Object.keys(schedules) as Package[]).map((packageId) => (
            <button
              key={packageId}
              type="button"
              aria-pressed={selected === packageId}
              onClick={() => {
                setSelected(packageId);
                track(`package_select_${packageId}`, { package_name: schedules[packageId].label });
              }}
              className={`min-h-11 px-4 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A93FF] ${
                selected === packageId ? "bg-white text-[#0A111F]" : "text-white hover:bg-white/10"
              }`}
            >
              {schedules[packageId].label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xl font-medium text-white md:text-2xl" aria-live="polite">
        {activeSchedule.timeline}
      </p>
      <p className="mt-2 text-sm text-white/60">
        These are estimated durations in days. The final schedule is agreed in writing before work begins. Growth Site timing is set in its quote.
      </p>

      <ol className={`process-timeline mt-10 ${compact ? "process-timeline-compact" : ""}`}>
        {processSteps.map((step) => (
          <li key={step.index} className={step.name === "Build" ? "process-timeline-step process-timeline-build" : "process-timeline-step"}>
            <span className="process-timeline-marker" aria-hidden="true" />
            <p className="font-mono text-xs tracking-[0.12em] text-[#7A93FF]">{step.index}</p>
            <h3 className="mt-2 text-lg font-medium text-white">{step.name}</h3>
            <p className="mt-2 text-sm font-medium text-white" aria-live={step.index === "01" ? "polite" : undefined}>
              {durations[selected][Number(step.index) - 1]}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{step.what}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              <span className="font-medium text-white/75">Your part: </span>
              {step.you}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
