import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
    query = query.ilike("title", `%${filters.search}%`);
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: user.id,
      type: card.type,
      title: card.title,
      content: card.content as Json,
      tags: card.tags,
      language: card.language || null,
      project_id: card.project_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function updateCard(id: string, updates: Partial<Pick<Card, "title" | "content" | "tags" | "language" | "project_id" | "is_archived" | "last_reviewed_at" | "review_interval" | "review_ease">>) {
  const { data, error } = await supabase
    .from("cards")
    .update({
      ...updates,
      content: updates.content ? (updates.content as Json) : undefined,
    })
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: project.name,
      description: project.description || null,
      repo_url: project.repo_url || null,
      color: project.color || "#0B1220",
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
