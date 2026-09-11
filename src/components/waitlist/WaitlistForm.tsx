import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email();

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("waitlist", {
        body: { email: parsed.data, source },
      });
      if (error) throw error;
      setStatus(data?.status === "duplicate" ? "duplicate" : "success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-[14px] text-[#111111]">You're on the list. We'll be in touch.</p>
    );
  }

  if (status === "duplicate") {
    return <p className="text-[14px] text-[#111111]">You're already on the list.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full"
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
        className="h-11 w-full sm:w-[280px] rounded-[6px] border-[#E8ECEF] bg-white text-[#111111] placeholder:text-[#888888]"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 rounded-[6px] bg-[#111111] text-white hover:bg-[#111111]/90"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Join the waitlist"
        )}
      </Button>
      {status === "error" && (
        <p className="text-[14px] text-[#111111] sm:hidden">Something went wrong. Try again.</p>
      )}
    </form>
  );
}

export function WaitlistError() {
  return null;
}
