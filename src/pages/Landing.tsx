import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: BookOpen,
    title: "Lecture notes, automatically",
    description: "Record any lecture and get structured notes without lifting a pen.",
  },
  {
    icon: Brain,
    title: "Flashcards that actually stick",
    description:
      "AI-generated flashcards with built-in spaced repetition so you remember what you study.",
  },
  {
    icon: FileText,
    title: "Textbooks made digestible",
    description:
      "Upload a chapter or research paper and get a summary and study questions instantly.",
  },
];

export function LandingNav() {
  return (
    <nav className="bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-[18px] font-semibold text-[#111111]">
          Aisom Study Buddy
        </Link>
        <Button variant="ghost" asChild className="text-[#111111]">
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </div>
    </nav>
  );
}

export default function Landing() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    supabase
      .rpc("waitlist_count")
      .then(({ data }: { data: number | null }) => setCount(Number(data ?? 0)))
      .catch((error: unknown) => {
        console.warn("Failed to load waitlist count", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-20 text-center md:min-h-[calc(100vh-76px)] md:py-0">
          <p className="text-[13px] text-[#888888]">Coming soon</p>
          <h1 className="mt-4 text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111111] md:text-[52px]">
            Study smarter. Remember more.
          </h1>
          <p className="mt-5 max-w-[480px] text-[16px] text-[#444444]">
            Aisom Study Buddy helps students turn lectures, notes, and textbooks into knowledge that
            actually sticks. Be the first to know when we launch.
          </p>
          <div className="mt-8 w-full max-w-[480px]">
            <WaitlistForm source="landing-hero" />
          </div>
          <p className="mt-3 text-[12px] text-[#888888]">No spam. Just a launch notification.</p>
          {count > 0 && (
            <p className="mt-6 text-[13px] text-[#888888]">Joined by {count} students already.</p>
          )}
        </section>

        {/* Feature teasers */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-[22px] font-semibold text-[#111111]">What's coming</h2>
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center md:text-left">
                <Icon className="mx-auto h-5 w-5 text-[#111111] md:mx-0" strokeWidth={1.75} />
                <h3 className="mt-4 text-[15px] font-medium text-[#111111]">{title}</h3>
                <p className="mt-2 text-[14px] text-[#888888]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Second CTA */}
        <section className="bg-[#F4F6F8] py-16">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-[24px] font-semibold text-[#111111]">Get early access</h2>
            <div className="mx-auto mt-8 w-full max-w-[480px]">
              <WaitlistForm source="landing-cta" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8ECEF] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-[13px] text-[#888888]">
          <span>© 2025 Aisom</span>
          <span>app.aisom.co.za</span>
        </div>
      </footer>
    </div>
  );
}
