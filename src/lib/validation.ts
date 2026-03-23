import { z } from "zod";

// Tag validation: lowercase alphanumeric and hyphens only
const tagSchema = z
  .string()
  .max(50, "Tag too long")
  .regex(/^[a-z0-9-]+$/, "Tags: lowercase alphanumeric and hyphens only");

// Card creation schema
export const createCardSchema = z.object({
  type: z.enum(["bug", "adr", "concept", "library", "learning", "interview", "project"]),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters")
    .transform((s) => s.trim()),
  content: z
    .record(z.unknown())
    .refine(
      (obj) => JSON.stringify(obj).length < 50_000,
      "Card content too large (max 50KB)"
    ),
  tags: z.array(tagSchema).max(10, "Maximum 10 tags allowed"),
  language: z.string().max(30).optional(),
  project_id: z.string().uuid("Invalid project ID").optional(),
});

// Card update schema
export const updateCardSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .transform((s) => s.trim())
    .optional(),
  content: z
    .record(z.unknown())
    .refine((obj) => JSON.stringify(obj).length < 50_000, "Content too large")
    .optional(),
  tags: z.array(tagSchema).max(10).optional(),
  language: z.string().max(30).optional(),
  project_id: z.string().uuid().nullable().optional(),
  is_archived: z.boolean().optional(),
  last_reviewed_at: z.string().datetime().optional(),
  review_interval: z.number().int().min(1).max(365).optional(),
  review_ease: z.number().min(1.3).max(5.0).optional(),
});

// Project creation schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .transform((s) => s.trim()),
  description: z.string().max(1000).optional(),
  repo_url: z
    .string()
    .url("Invalid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
    .optional(),
});

// Profile update schema
export const updateProfileSchema = z.object({
  display_name: z.string().max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Username: lowercase alphanumeric, hyphens, underscores only")
    .optional(),
  avatar_url: z.string().url().max(500).optional(),
  onboarded: z.boolean().optional(),
  preferred_languages: z.array(z.string().max(30)).max(20).optional(),
  primary_role: z.string().max(100).optional(),
  github_username: z.string().max(100).optional(),
});

// Search query schema
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query required")
    .max(500, "Query too long")
    .transform((s) => s.trim()),
});

// Sanitize string content - strip any HTML tags
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Sanitize all string values in a content object
export function sanitizeCardContent(content: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) => (typeof v === "string" ? sanitizeText(v) : v));
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
