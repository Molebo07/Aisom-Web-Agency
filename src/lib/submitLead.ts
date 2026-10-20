import { supabase } from "@/integrations/supabase/client";

export type LeadKind = "quote" | "snapshot" | "newsletter";

export interface LeadPayload {
  kind: LeadKind;
  name?: string;
  businessName?: string;
  email: string;
  phone?: string;
  industry?: string;
  budgetRange?: string;
  packageInterest?: string;
  websiteUrl?: string;
  details?: string;
  pagePath: string;
  consent?: boolean;
  marketingConsent?: boolean;
  company?: string;
}

function getSubmissionError(result: unknown) {
  if (typeof result === "object" && result !== null && "error" in result) {
    const error = result.error;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null) {
      const firstError = Object.values(error).flat().find((value) => typeof value === "string");
      if (typeof firstError === "string") return firstError;
    }
  }
  return "Your request could not be saved. Please try again.";
}

function isSuccessfulSubmission(result: unknown): boolean {
  return typeof result === "object" && result !== null && "ok" in result && result.ok === true;
}

export async function submitLead(payload: LeadPayload) {
  const endpoint = import.meta.env.VITE_SEND_LEAD_URL;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok || !isSuccessfulSubmission(result)) {
      throw new Error(getSubmissionError(result));
    }
    return result;
  }

  const { data, error } = await supabase.functions.invoke("send-lead", { body: payload });
  if (error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      const result: unknown = await context.clone().json().catch(() => null);
      throw new Error(getSubmissionError(result));
    }
    throw error;
  }
  if (!isSuccessfulSubmission(data)) {
    throw new Error(getSubmissionError(data));
  }
  return data;
}
