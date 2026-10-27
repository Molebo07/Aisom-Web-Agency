import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/submitLead";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface DemoReply {
  reply: string;
}

interface DemoStart extends DemoReply {
  sessionToken: string;
  expiresAt: string;
}

interface StoredSession {
  token: string;
  expiresAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantDemoProps {
  storageRegion: string;
}

const STORAGE_KEY = "aisom-assistant-demo-session";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
const greeting =
  "Hi, I'm Aisom Assistant, an AI demo. Ask about Aisom's published website packages or process. I don't have information beyond that, and you can ask for a person at any time.";

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    const expiresAt = new Date(session.expiresAt).getTime();
    if (
      typeof session.token !== "string" ||
      typeof session.expiresAt !== "string" ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function AssistantDemo({ storageRegion }: AssistantDemoProps) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    session ? [{ role: "assistant", content: greeting }] : [],
  );
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoff, setHandoff] = useState({ name: "", email: "", phone: "", need: "" });
  const [handoffBusy, setHandoffBusy] = useState(false);
  const [handoffSent, setHandoffSent] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const captchaContainer = useRef<HTMLDivElement>(null);
  const captchaWidget = useRef<string | null>(null);
  const endOfMessages = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session) return;
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]',
    );
    if (existing) {
      if (window.turnstile) setTurnstileReady(true);
      else existing.addEventListener("load", () => setTurnstileReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => setTurnstileReady(true);
    script.onerror = () => setError("The security check could not load. Please try again later.");
    document.head.appendChild(script);
  }, [session]);

  useEffect(() => {
    if (!turnstileReady || !captchaContainer.current || !window.turnstile || session) return;
    if (captchaWidget.current) window.turnstile.remove(captchaWidget.current);
    captchaWidget.current = window.turnstile.render(captchaContainer.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => {
        setCaptchaToken("");
        setError("The security check failed. Please try again.");
      },
    });

    return () => {
      if (captchaWidget.current && window.turnstile) {
        window.turnstile.remove(captchaWidget.current);
        captchaWidget.current = null;
      }
    };
  }, [turnstileReady, session]);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && handoffOpen) setHandoffOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handoffOpen]);

  async function beginConversation() {
    if (!consent || !captchaToken) {
      setError("Agree to the chat notice and complete the security check first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<DemoStart>(
        "assistant-demo",
        { body: { action: "start", consent: true, turnstileToken: captchaToken } },
      );
      if (invokeError || !data?.sessionToken || !data.expiresAt || !data.reply) {
        throw new Error("The demo could not start.");
      }
      const nextSession = { token: data.sessionToken, expiresAt: data.expiresAt };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      } catch {
        throw new Error("This browser could not save the secure demo session. Check browser storage and try again.");
      }
      setSession(nextSession);
      setMessages([{ role: "assistant", content: data.reply }]);
      setCaptchaToken("");
      setConsent(false);
      track("assistant_demo_open");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The demo could not start.");
      if (captchaWidget.current && window.turnstile) window.turnstile.reset(captchaWidget.current);
      setCaptchaToken("");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!session || !message.trim() || busy) return;
    const submittedMessage = message.trim();
    if (submittedMessage.length > 1200) {
      setError("Messages must be 1,200 characters or fewer.");
      return;
    }
    setMessage("");
    setError("");
    setBusy(true);
    setMessages((current) => [...current, { role: "user", content: submittedMessage }]);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<DemoReply>(
        "assistant-demo",
        { body: { action: "message", sessionToken: session.token, message: submittedMessage } },
      );
      if (invokeError || !data?.reply) throw new Error("The assistant could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      track("assistant_demo_message_sent");
    } catch (caught) {
      setMessages((current) => current.slice(0, -1));
      setMessage(submittedMessage);
      setError(caught instanceof Error ? caught.message : "The assistant could not respond.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function deleteConversation() {
    if (!session || deleting) return;
    setDeleting(true);
    setError("");
    try {
      const { error: invokeError } = await supabase.functions.invoke("assistant-demo", {
        body: { action: "delete", sessionToken: session.token },
      });
      if (invokeError) throw new Error("The conversation could not be deleted. Please try again.");
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      setMessages([]);
      setConsent(false);
      setCaptchaToken("");
      setHandoffOpen(false);
      setHandoffSent(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The conversation could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  async function submitHandoff(event: FormEvent) {
    event.preventDefault();
    if (handoffBusy) return;
    setHandoffBusy(true);
    setError("");
    try {
      await submitLead({
        kind: "quote",
        name: handoff.name.trim(),
        email: handoff.email.trim(),
        phone: handoff.phone.trim(),
        productInterest: "AI assistant",
        details: `A visitor requested a person from the Aisom Assistant demo. Their note: ${handoff.need.trim() || "No additional note."}`,
        pagePath: "/assistant",
        consent: true,
      });
      setHandoffSent(true);
    } catch {
      console.error("assistant demo handoff submission failed");
      setError("Your request could not be sent. Please email sales@aisom.co.za.");
    } finally {
      setHandoffBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div>
        <p className="section-index">LIVE DEMO · AI ASSISTANT</p>
        <h2 className="mt-4 text-slate">Ask about Aisom</h2>
        <p className="mt-4 text-sm leading-relaxed text-ash">
          This demo answers from Aisom’s published website information only. It can be wrong; check
          important details with a person. Do not send sensitive, financial, medical or confidential
          information.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ash">
          Starting the chat sends your messages to OpenRouter for processing and stores the
          conversation in Aisom’s Supabase database ({storageRegion}) for up to 90 days. The
          configured model route uses Azure Sweden Central. You can delete the transcript using
          the chat control. See the{" "}
          <Link to="/privacy-policy" className="font-medium text-slate underline">
            privacy policy
          </Link>
          .
        </p>
        <Button
          type="button"
          variant="link"
          className="mt-3 min-h-11 px-0 text-slate"
          onClick={() => {
            setHandoffOpen(true);
            track("assistant_handover_click");
          }}
        >
          Talk to a person
        </Button>
      </div>

      <section
        aria-label="Aisom Assistant live demo"
        className="overflow-hidden border border-border bg-white shadow-sm"
      >
        <header className="flex items-center justify-between border-b border-border bg-navy px-4 py-4 text-white">
          <div>
            <p className="text-sm font-medium text-white">Aisom Assistant</p>
            <p className="mt-1 text-xs text-white/65">AI demo · Aisom information only</p>
          </div>
          <span className="rounded-sm border border-white/20 px-2 py-1 text-[11px] text-white/75">
            DEMO
          </span>
        </header>

        {!session ? (
          <div className="grid gap-4 p-5">
            <p className="text-sm leading-relaxed text-ash">
              Before the first message, please review how this demo handles chat information.
            </p>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-ash">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  setError("");
                }}
                className="mt-1 h-5 w-5 shrink-0"
              />
              <span>
                I agree that my messages will be sent to OpenRouter for model processing and stored
                by Aisom in {storageRegion} for up to 90 days. I will not share sensitive or
                confidential information. I can delete the transcript from the chat.
              </span>
            </label>
            <div ref={captchaContainer} aria-label="Security check" />
            {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
            <Button
              type="button"
              onClick={beginConversation}
              disabled={busy || !consent || !captchaToken || !TURNSTILE_SITE_KEY}
              className="min-h-11 w-full"
            >
              {busy ? "Starting demo…" : "Start the demo"}
            </Button>
            {!TURNSTILE_SITE_KEY && (
              <p role="status" className="text-xs leading-relaxed text-ash">
                The demo is not configured yet. Contact Aisom to register early-access interest.
              </p>
            )}
          </div>
        ) : (
          <>
            <div
              className="max-h-[380px] min-h-[220px] space-y-3 overflow-y-auto p-4"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label="Conversation"
            >
              {messages.map((item, index) => (
                <p
                  key={`${item.role}-${index}`}
                  className={`max-w-[90%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed ${
                    item.role === "user"
                      ? "ml-auto bg-[#405FFF] text-white"
                      : "border border-border bg-secondary text-slate"
                  }`}
                >
                  {item.role === "assistant" && (
                    <span className="mb-1 block text-[11px] font-medium text-ash">
                      Aisom Assistant · AI
                    </span>
                  )}
                  {item.content}
                </p>
              ))}
              {busy && <p role="status" className="text-sm text-ash">Thinking…</p>}
              <div ref={endOfMessages} />
            </div>
            {error && <p role="alert" className="mx-4 mb-2 text-sm text-red-800">{error}</p>}
            <form onSubmit={sendMessage} className="border-t border-border p-3">
              <label htmlFor="assistant-demo-message" className="sr-only">Your message</label>
              <Textarea
                id="assistant-demo-message"
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1200}
                rows={3}
                placeholder="Ask about Aisom’s website packages or process"
                disabled={busy}
                className="resize-y"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-ash">{message.length}/1,200 characters</span>
                <Button type="submit" disabled={busy || !message.trim()} className="min-h-11">
                  Send
                </Button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2 border-t border-border px-3 py-3">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={() => {
                  setHandoffOpen(true);
                  track("assistant_handover_click");
                }}
              >
                Talk to a person
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                disabled={deleting || busy}
                onClick={deleteConversation}
              >
                {deleting ? "Deleting…" : "Delete this conversation"}
              </Button>
            </div>
          </>
        )}
      </section>

      {handoffOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHandoffOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-handoff-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-5 shadow-xl sm:p-7"
          >
            <h2 id="assistant-handoff-title" className="text-xl text-slate">Ask a person at Aisom</h2>
            {handoffSent ? (
              <div className="mt-5">
                <p role="status" className="text-sm leading-relaxed text-ash">
                  Your request has been saved. Aisom will follow up using the contact details you provided.
                </p>
                <Button type="button" className="mt-5 min-h-11" onClick={() => setHandoffOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={submitHandoff} className="mt-5 grid gap-4">
                <p className="text-sm leading-relaxed text-ash">
                  This sends your contact details and note to Aisom so a person can follow up. It
                  does not send your chat transcript.
                </p>
                <div>
                  <label htmlFor="assistant-handoff-name" className="mb-1 block text-sm font-medium text-slate">Name</label>
                  <Input
                    id="assistant-handoff-name"
                    value={handoff.name}
                    onChange={(event) => setHandoff({ ...handoff, name: event.target.value })}
                    maxLength={120}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assistant-handoff-email" className="mb-1 block text-sm font-medium text-slate">Email</label>
                  <Input
                    id="assistant-handoff-email"
                    type="email"
                    value={handoff.email}
                    onChange={(event) => setHandoff({ ...handoff, email: event.target.value })}
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assistant-handoff-phone" className="mb-1 block text-sm font-medium text-slate">Phone or WhatsApp (optional)</label>
                  <Input
                    id="assistant-handoff-phone"
                    value={handoff.phone}
                    onChange={(event) => setHandoff({ ...handoff, phone: event.target.value })}
                    maxLength={40}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="assistant-handoff-need" className="mb-1 block text-sm font-medium text-slate">What do you need help with? (optional)</label>
                  <Textarea
                    id="assistant-handoff-need"
                    value={handoff.need}
                    onChange={(event) => setHandoff({ ...handoff, need: event.target.value })}
                    maxLength={500}
                    rows={3}
                  />
                </div>
                <label className="flex items-start gap-3 text-sm leading-relaxed text-ash">
                  <input type="checkbox" required className="mt-1 h-5 w-5 shrink-0" />
                  <span>
                    Aisom may use these details to respond to this request, as described in the{" "}
                    <Link to="/privacy-policy" className="font-medium text-slate underline">privacy policy</Link>.
                  </span>
                </label>
                {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="ghost" className="min-h-11" onClick={() => setHandoffOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={handoffBusy} className="min-h-11">
                    {handoffBusy ? "Sending…" : "Send request"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
