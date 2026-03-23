import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript", "javascript", "python", "rust", "go", "java",
        "cpp", "csharp", "ruby", "swift", "kotlin", "php", "bash",
        "sql", "html", "css", "json", "yaml", "dockerfile",
      ],
    });
  }
  return highlighterPromise;
}
