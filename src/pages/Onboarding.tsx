import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import type { Card } from "@/lib/api";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseClient as any;
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bug, Command, CalendarDays, Code2, Check } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";
import { useWorkspace } from "@/hooks/useWorkspace";

const languages = [
  "TypeScript", "JavaScript", "Python", "Rust", "Go",
  "Java", "C++", "C#", "Ruby", "Swift",
  "Kotlin", "PHP", "Dart", "Elixir", "Haskell",
  "SQL", "Bash", "HTML/CSS", "Other",
];

const roles = [
  "Software Engineer", "Frontend Engineer", "Backend Engineer",
  "Full-Stack Engineer", "DevOps/Platform", "Data Engineer",
  "ML Engineer", "Computer Science Student", "Other",
];

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const { activeWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [displayName, setDisplayName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [nameError, setNameError] = useState("");

  // Step 2
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState("");

  // Step 3
  const [symptom, setSymptom] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [fix, setFix] = useState("");
  const [keyInsight, setKeyInsight] = useState("");
  const [tags, setTags] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 4
  const [createdCard, setCreatedCard] = useState<Card | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  // Redirect if already onboarded
  useEffect(() => {
    if (profile?.onboarded) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  // Pre-fill display name
  useEffect(() => {
    if (profile?.display_name && !displayName) {
      setDisplayName(profile.display_name);
    } else if (user?.email && !displayName) {
      setDisplayName(user.email.split("@")[0]);
    }
  }, [profile, user, displayName]);

  // Auto-focus first input on step change
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [step]);

  // Prevent browser back navigation during onboarding
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (step < 4) {
        window.history.pushState(null, "", window.location.href);
        if (step > 1) setStep((s) => s - 1);
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [step]);

  const handleStep1Continue = async () => {
    if (!displayName.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        github_username: githubUsername.trim() || null,
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_languages: selectedLangs,
        primary_role: primaryRole || null,
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save preferences");
      return;
    }
    setStep(3);
  };

  const handleStep3Continue = async () => {
    const errors: Record<string, string> = {};
    if (!symptom.trim()) errors.symptom = "Symptom is required";
    if (!fix.trim()) errors.fix = "Fix is required";
    if (!keyInsight.trim()) errors.keyInsight = "Key insight is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const cardTitle = symptom.trim().slice(0, 80);
    const content = {
      symptom: symptom.trim(),
      stack_trace: stackTrace.trim(),
      fix: fix.trim(),
      key_insight: keyInsight.trim(),
    };
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
      .filter(Boolean)
      .slice(0, 10);

    const { data, error } = await supabase
      .from("cards")
      .insert({
        user_id: user!.id,
        type: "bug",
        title: cardTitle,
        content,
        tags: parsedTags,
        workspace_id: activeWorkspaceId,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to create card. Please try again.");
      return;
    }
    setCreatedCard(data);
    setStep(4);
  };

  const handleFinish = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", user!.id);
    setSaving(false);
    navigate("/app/dashboard", { replace: true });
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Don't submit from textareas
        if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
        e.preventDefault();
        if (step === 1) handleStep1Continue();
        else if (step === 2) handleStep2Continue();
        else if (step === 3) handleStep3Continue();
        else if (step === 4) handleFinish();
      }
    },
    [step, displayName, symptom, fix, keyInsight, handleStep1Continue, handleStep2Continue, handleStep3Continue, handleFinish]
  );

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  const firstName = displayName.split(" ")[0] || "there";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "hsl(210 20% 97%)" }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-lg">
        <div className="bg-background border border-border rounded-[14px] p-10">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <Progress value={(step / 4) * 100} className="flex-1 h-1 mr-4" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{step} of 4</span>
          </div>

          {/* Step content */}
          {saving ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-[22px] font-semibold text-foreground">
                      Welcome to Aisom, {firstName}.
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "hsl(0 0% 27%)" }}>
                      Your personal knowledge system for software engineering. Let's get you set up in 2 minutes.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="displayName">What should we call you?</Label>
                    <Input
                      ref={firstInputRef}
                      id="displayName"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setNameError(""); }}
                      placeholder="Keanetse"
                      className="mt-1.5"
                    />
                    {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub username (optional)</Label>
                    <Input
                      id="github"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="keanetse"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-[22px] font-semibold text-foreground">
                      What languages do you work with most?
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "hsl(0 0% 27%)" }}>
                      We'll use this to auto-suggest card types and syntax highlighting defaults.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => {
                      const selected = selectedLangs.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() =>
                            setSelectedLangs((prev) =>
                              selected ? prev.filter((l) => l !== lang) : [...prev, lang]
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/30"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <Label>Primary role</Label>
                    <Select value={primaryRole} onValueChange={setPrimaryRole}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[22px] font-semibold text-foreground">
                      Capture your first piece of knowledge.
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "hsl(0 0% 27%)" }}>
                      The fastest way to understand Aisom is to save something real. We'll guide you through your first Bug Card.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="symptom">Symptom *</Label>
                    <Input
                      ref={firstInputRef}
                      id="symptom"
                      value={symptom}
                      onChange={(e) => { setSymptom(e.target.value); setFieldErrors((p) => ({ ...p, symptom: "" })); }}
                      placeholder="TypeError: Cannot read properties of undefined (reading 'map')"
                      className="mt-1.5"
                    />
                    {fieldErrors.symptom && <p className="text-xs text-destructive mt-1">{fieldErrors.symptom}</p>}
                  </div>
                  <div>
                    <Label htmlFor="stack_trace">Stack trace (optional)</Label>
                    <Textarea
                      id="stack_trace"
                      value={stackTrace}
                      onChange={(e) => setStackTrace(e.target.value)}
                      placeholder={"at Array.map (<anonymous>)\n    at processData (utils.js:42)"}
                      className="mt-1.5 font-mono text-[13px] min-h-[80px] bg-primary text-primary-foreground placeholder:text-primary-foreground/40 border-primary rounded-md p-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fix">Fix *</Label>
                    <Input
                      id="fix"
                      value={fix}
                      onChange={(e) => { setFix(e.target.value); setFieldErrors((p) => ({ ...p, fix: "" })); }}
                      placeholder="Add null check before calling .map()"
                      className="mt-1.5"
                    />
                    {fieldErrors.fix && <p className="text-xs text-destructive mt-1">{fieldErrors.fix}</p>}
                  </div>
                  <div>
                    <Label htmlFor="keyInsight">What do you now know? *</Label>
                    <Input
                      id="keyInsight"
                      value={keyInsight}
                      onChange={(e) => { setKeyInsight(e.target.value); setFieldErrors((p) => ({ ...p, keyInsight: "" })); }}
                      placeholder="Always check if the API response is an array before mapping"
                      className="mt-1.5"
                    />
                    {fieldErrors.keyInsight && <p className="text-xs text-destructive mt-1">{fieldErrors.keyInsight}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="typescript, react, null-check"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-[26px] font-bold text-foreground">
                      Your second brain is ready.
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "hsl(0 0% 27%)" }}>
                      You just saved your first piece of knowledge. Every bug you fix from here is one you'll never have to re-debug.
                    </p>
                  </div>

                  {/* Preview card */}
                  {createdCard && (
                    <div className="border border-border rounded-xl p-5 bg-background">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-destructive/10 text-destructive border-0 text-[11px]">
                          <Bug className="h-3 w-3 mr-1" />
                          Bug Card
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-2">{createdCard.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(createdCard.tags || []).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature teasers */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Command className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">Cmd+K to search everything</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">Daily brief surfaces 3 cards each morning</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Code2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">VS Code extension lets you capture without leaving the IDE</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer buttons */}
          {!saving && (
            <div className="flex items-center justify-between mt-8">
              <div>
                {step > 1 && step < 4 && (
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              <div>
                {step < 4 ? (
                  <Button
                    className="bg-primary"
                    onClick={() => {
                      if (step === 1) handleStep1Continue();
                      else if (step === 2) handleStep2Continue();
                      else if (step === 3) handleStep3Continue();
                    }}
                  >
                    {step === 3 ? "Finish setup →" : "Continue"}
                  </Button>
                ) : (
                  <Button className="w-full h-12 bg-primary text-base" onClick={handleFinish}>
                    Go to my dashboard →
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
