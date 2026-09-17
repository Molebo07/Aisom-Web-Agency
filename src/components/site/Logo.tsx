import { cn } from "@/lib/utils";

export function Logomark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex h-8 w-8 items-center justify-center", dark && "rounded-sm bg-white p-1")}>
      <img src="/aisom-logomark-v2.svg" alt="" className={cn("h-full w-full", className)} />
    </span>
  );
}

export function Logo({ withWordmark = true, dark = false }: { withWordmark?: boolean; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Logomark dark={dark} />
      {withWordmark && <span className={cn("text-[17px] font-bold tracking-[-0.06em]", dark ? "text-white" : "text-slate")}>Aisom</span>}
    </span>
  );
}
