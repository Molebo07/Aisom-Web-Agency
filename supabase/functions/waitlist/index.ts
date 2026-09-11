import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3'

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(64).optional(),
})

// Simple in-memory rate limiter: 3 submissions per IP per hour
const HOUR = 60 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < HOUR)
  if (list.length >= 3) {
    hits.set(ip, list)
    return true
  }
  list.push(now)
  hits.set(ip, list)
  return false
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return json({ error: 'Too many attempts. Please try again later.' }, 429)
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const parsed = BodySchema.safeParse(payload)
  if (!parsed.success) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }

  const email = parsed.data.email.toLowerCase()
  const source = parsed.data.source ?? 'landing'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await supabase.from('waitlist').insert({ email, source })

  if (error) {
    if (error.code === '23505') {
      return json({ status: 'duplicate', message: "You're already on the list." }, 200)
    }
    console.error('waitlist insert failed', error.message)
    return json({ error: 'Something went wrong. Try again.' }, 500)
  }

  return json({ status: 'ok', message: "You're on the list. We'll be in touch." }, 200)
})
