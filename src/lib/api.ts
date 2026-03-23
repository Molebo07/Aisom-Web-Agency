import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  createCardSchema,
  updateCardSchema,
  createProjectSchema,
  updateProfileSchema,
  sanitizeCardContent,
} from "@/lib/validation";

export type CardType = "bug" | "adr" | "concept" | "library" | "learning" | "interview" | "project";

export interface Card {
  id: string;
  user_id: string;
  type: CardType;
  title: string;
  content: Record<string, any>;
  tags: string[];
  language: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
  review_interval: number;
  review_ease: number;
  is_archived: boolean;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  repo_url: string | null;
  color: string;
  created_at: string;
}

// Cards
export async function fetchCards(filters?: { type?: string; search?: string }) {
  let query = supabase
    .from("cards")
    .select("*")
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }
  if (filters?.search) {
    // Sanitize search input
    const sanitizedSearch = filters.search.replace(/<[^>]*>/g, "").trim().slice(0, 200);
    query = query.ilike("title", `%${sanitizedSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Card[];
}

export async function fetchCardsDueForReview() {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("is_archived", false)
    .or("last_reviewed_at.is.null,last_reviewed_at.lte." + new Date(Date.now() - 86400000).toISOString())
    .order("review_ease", { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data || []) as Card[];
}

export async function createCard(card: {
  type: CardType;
  title: string;
  content: Record<string, any>;
  tags: string[];
  language?: string;
  project_id?: string;
}) {
  // Validate input with Zod
  const validated = createCardSchema.parse(card);

  // Sanitize content
  const sanitizedContent = sanitizeCardContent(validated.content as Record<string, unknown>);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: user.id,
      type: validated.type,
      title: validated.title,
      content: sanitizedContent as Json,
      tags: validated.tags,
      language: validated.language || null,
      project_id: validated.project_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function updateCard(id: string, updates: Partial<Pick<Card, "title" | "content" | "tags" | "language" | "project_id" | "is_archived" | "last_reviewed_at" | "review_interval" | "review_ease">>) {
  // Validate
  const validated = updateCardSchema.parse(updates);

  const sanitizedUpdates: Record<string, any> = { ...validated };
  if (validated.content) {
    sanitizedUpdates.content = sanitizeCardContent(validated.content as Record<string, unknown>) as Json;
  }

  const { data, error } = await supabase
    .from("cards")
    .update(sanitizedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
}

// Projects
export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Project[];
}

export async function createProject(project: { name: string; description?: string; repo_url?: string; color?: string }) {
  // Validate
  const validated = createProjectSchema.parse(project);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: validated.name,
      description: validated.description || null,
      repo_url: validated.repo_url || null,
      color: validated.color || "#0B1220",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

// Profile
export async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates: { display_name?: string; username?: string; avatar_url?: string; onboarded?: boolean }) {
  // Validate
  const validated = updateProfileSchema.parse(updates);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(validated)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
