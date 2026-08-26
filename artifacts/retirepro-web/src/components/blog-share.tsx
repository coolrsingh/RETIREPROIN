import { useState } from "react";
import { Check, Copy, Linkedin, MessageCircle, Share2, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface BlogShareProps {
  title: string;
  slug: string;
}

const SITE_URL = "https://retirepro.in";

export default function BlogShare({ title, slug }: BlogShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  const recordShare = (channel: string) => {
    trackEvent("share_clicked", { channel, source: "blog", article: slug });
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(articleUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = articleUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopied(true);
      recordShare("copy_link");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: title, url: articleUrl });
      recordShare("native");
    } catch (error) {
      // Closing the native share sheet is not an error.
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  };

  return (
    <div className="relative mb-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Share2 className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-slate-700">Share this article</span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <button
            type="button"
            onClick={nativeShare}
            aria-label="Share using your device"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          aria-controls={`blog-share-menu-${slug}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {isOpen ? <X className="h-3.5 w-3.5" aria-hidden="true" /> : <Share2 className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{isOpen ? "Close" : "More options"}</span>
        </button>
      </div>

      {isOpen && (
        <div
          id={`blog-share-menu-${slug}`}
          role="group"
          aria-label="Share options"
          className="absolute right-3 top-[calc(100%+8px)] z-20 grid min-w-[210px] gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:right-5 sm:flex sm:min-w-0"
        >
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordShare("whatsapp")}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordShare("linkedin")}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </a>
          <a
            href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordShare("x")}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
          >
            <span className="flex h-4 w-4 items-center justify-center text-sm font-bold" aria-hidden="true">𝕏</span>
            X
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}