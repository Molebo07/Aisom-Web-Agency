# Assistant demo operations

The demo is fail-closed. It stays unavailable unless the Edge Function is enabled and the site is built with its public-demo flag and all required public configuration. Do not enable either flag until the storage region, model route, legal terms, budget controls and Turnstile hostnames have been verified.

## Required configuration

Set Edge Function secrets in the Supabase project secret manager, not in source control or chat:

- `ASSISTANT_DEMO_ENABLED`: leave unset or `false` until launch approval; set to `true` only after all checks below.
- `ASSISTANT_STORAGE_REGION`: the exact region shown for the Supabase project. Confirm it in the dashboard.
- `ASSISTANT_ALLOWED_ORIGINS`: comma-separated HTTPS origins, with no trailing slash; include only production website origins.
- `ASSISTANT_SESSION_SECRET`: a randomly generated secret with at least 32 bytes.
- `TURNSTILE_SECRET_KEY`: the secret for the configured Turnstile site key.
- `OPENROUTER_API_KEY`: a restricted key with an appropriate spend limit.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: the project URL and server-only service role key. Never expose the service role key to the browser.

The website build needs these public variables:

- `VITE_ASSISTANT_DEMO_ENABLED=true`
- `VITE_ASSISTANT_STORAGE_REGION`: must exactly match the confirmed Supabase project region.
- `VITE_TURNSTILE_SITE_KEY`: the public key for the production hostname.
- The existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The website renders the widget only when every required public variable is present. Keep the public flag unset while the function or provider is being tested.
Keep Supabase Edge Function JWT verification enabled; do not add a `verify_jwt = false` override.

## Launch checks

1. Confirm the Supabase project region and apply the migration. Confirm `pg_cron` is available and the scheduled 90-day cleanup job exists.
2. Verify the selected OpenRouter model and Azure Sweden Central route, current prices, provider data-handling settings, and applicable contractual terms. The function pins the route, disallows fallbacks, requests data-collection denial/ZDR, and sets provider price ceilings; verify these settings against current provider documentation before launch.
3. Configure Turnstile for each exact production hostname and ensure the Edge Function origin allow-list contains only those HTTPS origins.
4. Confirm the request ceiling remains valid: at most 15,000 serialized prompt bytes, 256 output tokens, the configured model price ceilings, and a conservative R50/USD conversion ceiling. Each model request reserves up to 24 cents toward a global R50/day budget. If model/provider prices or the conversion assumption change, update and retest the reservation and migration together before enabling.
5. Test consent, rate limiting, daily budget exhaustion, sensitive-input rejection, transcript deletion, retention cleanup, and the production-hostname Turnstile check in a non-public environment.
6. Only after those checks pass, enable the Edge Function and deploy a site build with the public flag enabled. Keep the flags aligned: the Edge Function flag is the API kill switch; the website flag only hides or shows the widget and does not disable direct API requests.

The demo is not a customer support channel, does not integrate with WhatsApp, and should not receive sensitive or confidential information. The privacy policy must continue to disclose the actual storage region and configured processors whenever the demo is enabled.
