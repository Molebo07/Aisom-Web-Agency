import { MD5 } from "crypto-js";

export const PAYFAST_MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID || "34450571";
export const PAYFAST_MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "23rdsjcpv0czb";

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

function buildSignatureString(values: Record<string, string>) {
  const keys = Object.keys(values).filter(
    (key) => values[key] !== undefined && values[key] !== "" && key !== "signature"
  );

  return keys
    .sort()
    .map((key) => `${key}=${encodeURIComponent(values[key])}`)
    .join("&");
}

export function generatePayfastSignature(values: Record<string, string>) {
  const signatureString = buildSignatureString(values);
  return MD5(signatureString).toString();
}

export function getPayfastActionUrl(useSandbox = false) {
  return useSandbox ? PAYFAST_SANDBOX_GATEWAY_URL : PAYFAST_GATEWAY_URL;
}

export function buildPayfastFields(
  plan: PayfastPlan,
  amount: number,
  annual: boolean,
  returnUrl: string,
  cancelUrl: string
) {
  const amountString = amount.toFixed(2);
  const frequencyLabel = annual ? "annual" : "monthly";

  const values: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    m_payment_id: `${plan.id}-${frequencyLabel}`,
    amount: amountString,
    item_name: `${plan.name} ${annual ? "Annual" : "Monthly"}`,
    item_description: plan.itemDescription,
    email_address: "",
  };

  return {
    ...values,
    signature: generatePayfastSignature(values),
  };
}
