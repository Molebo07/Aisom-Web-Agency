import { Link } from "react-router-dom";
import { LandingNav } from "@/pages/Landing";

export default function Placeholder() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-32 text-center">
        <p className="text-[22px] font-semibold text-[#111111]">Coming soon</p>
        <Link to="/" className="mt-4 text-[14px] text-[#888888] underline">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
