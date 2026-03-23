import { useEffect, useState } from "react";
import { getHighlighter } from "@/lib/shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!code.trim()) return;
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      try {
        const supportedLangs = hl.getLoadedLanguages();
        const lang = supportedLangs.includes(language) ? language : "typescript";
        const highlighted = hl.codeToHtml(code, {
          lang,
          theme: "github-dark",
        });
        setHtml(highlighted);
      } catch {
        // Fallback — render plain
        setHtml("");
      }
    });
    return () => { cancelled = true; };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="rounded-[10px] p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-primary text-primary-foreground">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="shiki-wrapper rounded-[10px] overflow-x-auto text-sm leading-relaxed [&_.shiki]:!bg-[hsl(216,58%,9%)] [&_.shiki]:!rounded-[10px] [&_.shiki]:!p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
