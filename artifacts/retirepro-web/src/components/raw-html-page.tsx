import { useEffect } from "react";

/**
 * Renders a standalone HTML document (imported via `?raw`) inside the SPA.
 * Extracts the document's <style> block and <body> contents and injects them.
 * Also syncs the document's <title> and <meta name="description"> into the
 * live page head on mount, restoring the previous values on unmount.
 * Used for the static legal/compliance pages which ship as full HTML files.
 */
export default function RawHtmlPage({ html }: { html: string }) {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const css = styleMatch?.[1] ?? "";
  const body = bodyMatch?.[1] ?? html;

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    ?? html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const pageTitle = titleMatch?.[1]?.trim() ?? "";
  const pageDesc = descMatch?.[1]?.trim() ?? "";

  useEffect(() => {
    const prevTitle = document.title;
    const descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = descEl?.content ?? "";

    if (pageTitle) document.title = pageTitle;
    if (pageDesc && descEl) descEl.content = pageDesc;

    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle;
      if (descEl) descEl.content = prevDesc;
    };
  }, [pageTitle, pageDesc]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
