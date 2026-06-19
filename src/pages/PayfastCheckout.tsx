import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { payfastPlans, fetchPayfastFields, getPayfastActionUrl } from "@/lib/payfast";

export default function PayfastCheckout() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "pro";
  const annual = searchParams.get("annual") === "1";
  const status = searchParams.get("status");
  const plan = planId && planId in payfastPlans ? payfastPlans[planId as keyof typeof payfastPlans] : null;

  const displayAmount = useMemo(() => {
    if (!plan) return "R0";
    const amount = plan.monthlyPrice * (annual ? 10 : 1);
    return `${plan.currency}${amount.toFixed(2)}`;
  }, [plan, annual]);

  const useSandbox = import.meta.env.VITE_PAYFAST_USE_SANDBOX === "1";
  const actionUrl = getPayfastActionUrl(useSandbox);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const returnUrl = `${origin}/checkout?plan=${planId}&annual=${annual ? 1 : 0}&status=success`;
  const cancelUrl = `${origin}/checkout?plan=${planId}&annual=${annual ? 1 : 0}&status=cancelled`;

  const [formFields, setFormFields] = useState<Record<string, string> | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    setSignError(null);
    setFormFields(null);
    fetchPayfastFields({ planId: plan.id, annual, returnUrl, cancelUrl })
      .then((fields) => {
        if (!cancelled) setFormFields(fields);
      })
      .catch((err) => {
        if (!cancelled) setSignError(err instanceof Error ? err.message : "Unable to prepare payment");
      });
    return () => {
      cancelled = true;
    };
  }, [plan, annual, returnUrl, cancelUrl]);

  if (!plan) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Payment plan not found</h1>
        <p className="text-sm text-muted-foreground mb-6">Please select a valid plan from the pricing section.</p>
        <Button asChild>
          <Link to="/#pricing">Back to pricing</Link>
        </Button>
      </div>
    );
  }

  const paymentStatusMessage =
    status === "success"
      ? "Payment completed successfully. Thank you for upgrading to Aisom."
      : status === "cancelled"
      ? "Payment was cancelled. You can try again or choose another plan."
      : null;

  return (
    <div className="py-20 px-6 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-background p-8 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Payfast checkout
              <Badge className="bg-amber-200 text-amber-900">{useSandbox ? "Sandbox" : "Live"}</Badge>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-foreground">Complete your {annual ? "annual" : "monthly"} {plan.name} payment</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              You are about to pay {displayAmount} for the {plan.name} plan. Payfast will process your subscription securely.
            </p>
          </div>

          {paymentStatusMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {paymentStatusMessage}
            </div>
          )}

          <div className="rounded-3xl border border-border bg-secondary/50 p-6">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Order summary</div>
            <div className="space-y-2 text-sm text-foreground">
              <div className="flex justify-between">
                <span>Plan</span>
                <span>{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing</span>
                <span>{annual ? "Annual" : "Monthly"}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{displayAmount}</span>
              </div>
            </div>
          </div>

          <form method="post" action={actionUrl} className="space-y-4">
            {formFields &&
              Object.entries(formFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            {signError && (
              <p className="text-sm text-destructive">{signError}</p>
            )}
            <Button className="w-full py-4" type="submit" disabled={!formFields}>
              {formFields ? `Pay ${displayAmount} with Payfast` : "Preparing payment..."}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Need to change your selection? Return to pricing and select monthly or annual again.</p>
            <Link to="/#pricing" className="text-primary underline">
              Back to pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
