import { cn } from "@/lib/utils";

export function Logomark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-[4px] bg-slate text-[13px] font-bold text-white",
        className,
      )}
    >
      a
    </span>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Logomark />
      {withWordmark && (
        <span className="text-[17px] font-bold tracking-[-0.06em] text-slate">aisom</span>
      )}
    </span>
  );
}
