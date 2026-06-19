import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createHash } from 'node:crypto';

const MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID') ?? '';
const MERCHANT_KEY = Deno.env.get('PAYFAST_MERCHANT_KEY') ?? '';
const PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE') ?? '';

const PLANS: Record<string, { name: string; itemDescription: string; monthlyPrice: number }> = {
  pro: {
    name: 'Pro',
    itemDescription: 'Unlimited cards, AI search, spaced repetition, and advanced engineering knowledge workflows.',
    monthlyPrice: 150,
  },
  team: {
    name: 'Team',
    itemDescription: 'Shared team workspace, team ADR repository, shared bug knowledge base, and admin controls.',
    monthlyPrice: 250,
  },
};

function buildSignatureString(values: Record<string, string>) {
  return Object.keys(values)
    .filter((k) => values[k] !== undefined && values[k] !== '' && k !== 'signature')
    .sort()
    .map((k) => `${k}=${encodeURIComponent(values[k]).replace(/%20/g, '+')}`)
    .join('&');
}

function md5(input: string) {
  return createHash('md5').update(input).digest('hex');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!MERCHANT_ID || !MERCHANT_KEY) {
      return new Response(JSON.stringify({ error: 'Payment provider not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const planId = String(body.planId ?? '');
    const annual = Boolean(body.annual);
    const returnUrl = String(body.returnUrl ?? '');
    const cancelUrl = String(body.cancelUrl ?? '');

    const plan = PLANS[planId];
    if (!plan) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!/^https?:\/\//.test(returnUrl) || !/^https?:\/\//.test(cancelUrl)) {
      return new Response(JSON.stringify({ error: 'Invalid URLs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amount = (plan.monthlyPrice * (annual ? 10 : 1)).toFixed(2);
    const frequencyLabel = annual ? 'annual' : 'monthly';

    const values: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      m_payment_id: `${planId}-${frequencyLabel}`,
      amount,
      item_name: `${plan.name} ${annual ? 'Annual' : 'Monthly'}`,
      item_description: plan.itemDescription,
    };

    const sigBase = buildSignatureString(values) + (PASSPHRASE ? `&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, '+')}` : '');
    const signature = md5(sigBase);

    return new Response(JSON.stringify({ fields: { ...values, signature } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('payfast-sign error:', e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});