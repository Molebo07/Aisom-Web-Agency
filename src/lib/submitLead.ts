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

export async function submitLead(payload: LeadPayload) {
  const endpoint = import.meta.env.VITE_SEND_LEAD_URL;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof result?.error === "string" ? result.error : "Submission failed");
    }
    return result;
  }

  const { data, error } = await supabase.functions.invoke("send-lead", { body: payload });
  if (error) throw error;
  return data;
}
