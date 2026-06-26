import { useEffect } from "react";

/**
 * Renders a standalone HTML document (imported via `?raw`) inside the SPA.
 * Extracts the document's <style> block and <body> contents and injects them.
 * Used for the static legal/compliance pages which ship as full HTML files.
 */
export default function RawHtmlPage({ html }: { html: string }) {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const css = styleMatch?.[1] ?? "";
  const body = bodyMatch?.[1] ?? html;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
