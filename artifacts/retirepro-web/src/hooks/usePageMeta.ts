import { useEffect } from "react";

export interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterUrl?: string;
}

function getMetaEl(name: string): HTMLMetaElement | null {
  return document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
}

function getOgEl(property: string): HTMLMetaElement | null {
  return document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
}

function getCanonicalEl(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
}

function setMeta(name: string, value: string | undefined): string {
  const el = getMetaEl(name);
  const prev = el?.content ?? "";
  if (el && value !== undefined) el.content = value;
  return prev;
}

function setOg(property: string, value: string | undefined): string {
  const el = getOgEl(property);
  const prev = el?.content ?? "";
  if (el && value !== undefined) el.content = value;
  return prev;
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prev = {
      title: document.title,
      description: setMeta("description", meta.description),
      ogTitle: setOg("og:title", meta.ogTitle ?? meta.title),
      ogDescription: setOg("og:description", meta.ogDescription ?? meta.description),
      ogUrl: setOg("og:url", meta.ogUrl),
      ogType: setOg("og:type", meta.ogType),
      twitterTitle: setMeta("twitter:title", meta.twitterTitle ?? meta.ogTitle ?? meta.title),
      twitterDescription: setMeta("twitter:description", meta.twitterDescription ?? meta.ogDescription ?? meta.description),
      twitterUrl: setMeta("twitter:url", meta.twitterUrl ?? meta.ogUrl),
      canonical: getCanonicalEl()?.href ?? "",
    };

    document.title = meta.title;

    if (meta.canonical !== undefined) {
      const el = getCanonicalEl();
      if (el) el.href = meta.canonical;
    }

    return () => {
      document.title = prev.title;
      setMeta("description", prev.description);
      setOg("og:title", prev.ogTitle);
      setOg("og:description", prev.ogDescription);
      setOg("og:url", prev.ogUrl);
      setOg("og:type", prev.ogType);
      setMeta("twitter:title", prev.twitterTitle);
      setMeta("twitter:description", prev.twitterDescription);
      setMeta("twitter:url", prev.twitterUrl);
      const el = getCanonicalEl();
      if (el) el.href = prev.canonical;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
