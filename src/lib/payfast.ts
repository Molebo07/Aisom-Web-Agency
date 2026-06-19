export const PAYFAST_GATEWAY_URL = "https://www.payfast.co.za/eng/process";
export const PAYFAST_SANDBOX_GATEWAY_URL = "https://www.payfast.co.za/eng/process?test=1";

export type PayfastPlanId = "pro" | "team";

export interface PayfastPlan {
  id: PayfastPlanId;
  name: string;
  monthlyPrice: number;
  currency: string;
  itemName: string;
  itemDescription: string;
}

export const payfastPlans: Record<PayfastPlanId, PayfastPlan> = {
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 150,
    currency: "R",
    itemName: "Aisom Pro Subscription",
    itemDescription: "Unlimited cards, AI search, spaced repetition, and advanced engineering knowledge workflows.",
  },
  team: {
    id: "team",
    name: "Team",
    monthlyPrice: 250,
    currency: "R",
    itemName: "Aisom Team Subscription",
    itemDescription: "Shared team workspace, team ADR repository, shared bug knowledge base, and admin controls.",
  },
};

export function getPayfastActionUrl(useSandbox = false) {
  return useSandbox ? PAYFAST_SANDBOX_GATEWAY_URL : PAYFAST_GATEWAY_URL;
}

import { supabase } from "@/integrations/supabase/client";

export async function fetchPayfastFields(params: {
  planId: PayfastPlanId;
  annual: boolean;
  returnUrl: string;
  cancelUrl: string;
}): Promise<Record<string, string>> {
  const { data, error } = await supabase.functions.invoke("payfast-sign", { body: params });
  if (error) throw new Error(error.message);
  const fields = (data as { fields?: Record<string, string> })?.fields;
  if (!fields) throw new Error("Payment provider unavailable");
  return fields;
}
