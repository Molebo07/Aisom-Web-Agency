import { cn } from "@/lib/utils";

export function Logomark({ className }: { className?: string }) {
  return <img src="/aisom-logomark-v2.svg" alt="" className={cn("h-8 w-8", className)} />;
}

export function Logo({ withWordmark = true, dark = false }: { withWordmark?: boolean; dark?: boolean }) {
  return (
    <img
      src={dark ? "/aisom-primary-logo-v2-dark.svg" : "/aisom-primary-logo-v2.svg"}
      alt={withWordmark ? "Aisom Web Agency" : "Aisom"}
      className={cn("h-10 w-auto max-w-[164px] object-contain object-left", !withWordmark && "w-10 object-cover object-left")}
    />
  );
}
