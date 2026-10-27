CREATE TABLE public.assistant_demo_conversations (
  id uuid PRIMARY KEY,
  session_hash text NOT NULL UNIQUE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  locked_until timestamptz,
  CONSTRAINT assistant_demo_messages_are_array CHECK (jsonb_typeof(messages) = 'array')
);

ALTER TABLE public.assistant_demo_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.assistant_demo_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text NOT NULL,
  session_hash text NOT NULL,
  request_kind text NOT NULL CHECK (request_kind IN ('start', 'message')),
  reserved_zar_cents integer NOT NULL DEFAULT 0 CHECK (reserved_zar_cents >= 0),
  actual_zar_cents integer,
  latency_ms integer,
  outcome text NOT NULL DEFAULT 'reserved'
    CHECK (outcome IN ('reserved', 'success', 'provider_error', 'deleted')),
  CONSTRAINT assistant_demo_usage_actual_cost_nonnegative
    CHECK (actual_zar_cents IS NULL OR actual_zar_cents >= 0)
);

CREATE INDEX assistant_demo_usage_occurred_at_idx
  ON public.assistant_demo_usage (occurred_at);

CREATE INDEX assistant_demo_usage_ip_occurred_at_idx
  ON public.assistant_demo_usage (ip_hash, occurred_at);

CREATE INDEX assistant_demo_usage_session_occurred_at_idx
  ON public.assistant_demo_usage (session_hash, occurred_at);

ALTER TABLE public.assistant_demo_usage ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_demo_conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_demo_usage TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_assistant_demo_usage(
  p_ip_hash text,
  p_session_hash text,
  p_request_kind text,
  p_reserved_zar_cents integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now timestamptz := now();
  v_request_id uuid := gen_random_uuid();
  v_ip_minute_count integer;
  v_ip_day_count integer;
  v_session_minute_count integer;
  v_session_day_count integer;
  v_daily_reserved_cents bigint;
BEGIN
  IF p_ip_hash IS NULL OR length(p_ip_hash) <> 64
     OR p_session_hash IS NULL OR length(p_session_hash) <> 64
     OR p_request_kind IS NULL OR p_request_kind NOT IN ('start', 'message')
     OR p_reserved_zar_cents IS NULL OR p_reserved_zar_cents < 0 OR p_reserved_zar_cents > 24 THEN
    RAISE EXCEPTION 'Invalid assistant demo usage reservation';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('aisom-assistant-demo-daily-budget', 0));

  SELECT
    count(*) FILTER (WHERE occurred_at >= v_now - interval '1 minute'),
    count(*) FILTER (WHERE occurred_at >= date_trunc('day', v_now))
  INTO v_ip_minute_count, v_ip_day_count
  FROM public.assistant_demo_usage
  WHERE ip_hash = p_ip_hash;

  SELECT
    count(*) FILTER (WHERE occurred_at >= v_now - interval '1 minute'),
    count(*) FILTER (WHERE occurred_at >= date_trunc('day', v_now))
  INTO v_session_minute_count, v_session_day_count
  FROM public.assistant_demo_usage
  WHERE session_hash = p_session_hash;

  SELECT coalesce(sum(greatest(reserved_zar_cents, coalesce(actual_zar_cents, 0))), 0)
  INTO v_daily_reserved_cents
  FROM public.assistant_demo_usage
  WHERE occurred_at >= date_trunc('day', v_now);

  IF v_ip_minute_count >= 10 OR v_ip_day_count >= 40
     OR v_session_minute_count >= 6 OR v_session_day_count >= 20
     OR v_daily_reserved_cents + p_reserved_zar_cents > 5000 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.assistant_demo_usage (
    id, ip_hash, session_hash, request_kind, reserved_zar_cents
  )
  VALUES (
    v_request_id, p_ip_hash, p_session_hash, p_request_kind, p_reserved_zar_cents
  );

  RETURN v_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.append_assistant_demo_user_message(
  p_conversation_id uuid,
  p_session_hash text,
  p_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_messages jsonb;
BEGIN
  IF p_message IS NULL OR length(p_message) < 1 OR length(p_message) > 1200 THEN
    RAISE EXCEPTION 'Invalid assistant demo message';
  END IF;

  UPDATE public.assistant_demo_conversations
  SET messages = messages || jsonb_build_array(
        jsonb_build_object('role', 'user', 'content', p_message)
      ),
      locked_until = now() + interval '45 seconds',
      updated_at = now()
  WHERE id = p_conversation_id
    AND session_hash = p_session_hash
    AND expires_at > now()
    AND (locked_until IS NULL OR locked_until < now())
    AND jsonb_array_length(messages) <= 10
  RETURNING messages INTO v_messages;

  RETURN v_messages;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_assistant_demo_turn(
  p_conversation_id uuid,
  p_session_hash text,
  p_answer text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_answer IS NULL OR length(p_answer) < 1 OR length(p_answer) > 2000 THEN
    RAISE EXCEPTION 'Invalid assistant demo answer';
  END IF;

  UPDATE public.assistant_demo_conversations
  SET messages = messages || jsonb_build_array(
        jsonb_build_object('role', 'assistant', 'content', p_answer)
      ),
      locked_until = NULL,
      updated_at = now()
  WHERE id = p_conversation_id
    AND session_hash = p_session_hash
    AND locked_until > now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_assistant_demo_turn(
  p_conversation_id uuid,
  p_session_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.assistant_demo_conversations
  SET locked_until = NULL,
      updated_at = now()
  WHERE id = p_conversation_id
    AND session_hash = p_session_hash;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_assistant_demo_usage(
  p_request_id uuid,
  p_actual_zar_cents integer,
  p_latency_ms integer,
  p_outcome text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_actual_zar_cents IS NULL OR p_actual_zar_cents < 0
     OR p_latency_ms IS NULL OR p_latency_ms < 0
     OR p_outcome IS NULL OR p_outcome NOT IN ('success', 'provider_error', 'deleted') THEN
    RAISE EXCEPTION 'Invalid assistant demo usage finalization';
  END IF;

  UPDATE public.assistant_demo_usage
  SET actual_zar_cents = p_actual_zar_cents,
      latency_ms = p_latency_ms,
      outcome = p_outcome
  WHERE id = p_request_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_assistant_demo_usage(text, text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.append_assistant_demo_user_message(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_assistant_demo_turn(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.unlock_assistant_demo_turn(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_assistant_demo_usage(uuid, integer, integer, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reserve_assistant_demo_usage(text, text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.append_assistant_demo_user_message(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_assistant_demo_turn(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.unlock_assistant_demo_turn(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_assistant_demo_usage(uuid, integer, integer, text) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_assistant_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.assistant_demo_conversations WHERE expires_at <= now();
  DELETE FROM public.assistant_demo_usage
  WHERE occurred_at < now() - interval '90 days' + interval '15 minutes';
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_assistant_demo_data() FROM PUBLIC, anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'aisom-assistant-demo-retention',
  '*/15 * * * *',
  'SELECT public.cleanup_assistant_demo_data()'
);
