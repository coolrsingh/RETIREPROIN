import { useState } from "react";
import { Check, Copy, Linkedin, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface BlogShareProps {
  title: string;
  slug: string;
  className?: string;
}

const SITE_URL = "https://retirepro.in";

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}

/** A single circular icon button with a label underneath, matching the always-visible
 *  share-rail pattern (no click-to-reveal step). */
function ShareButton({
  label,
  onClick,
  href,
  bg,
  fg,
  ring,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  bg: string;
  fg: string;
  ring: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${fg} transition-transform duration-150 group-hover:scale-105 group-active:scale-95`}
      >
        {children}
      </span>
      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700">{label}</span>
    </>
  );

  const shared = `group flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 ${ring} focus-visible:ring-offset-2 rounded-full`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label={label} className={shared}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={shared}>
      {inner}
    </button>
  );
}

export default function BlogShare({ title, slug, className = "" }: BlogShareProps) {
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

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Share this article
      </span>
      <div className="flex flex-wrap items-start gap-4">
        {canNativeShare && (
          <ShareButton label="Share" onClick={nativeShare} bg="bg-slate-800" fg="text-white" ring="focus-visible:ring-slate-800">
            <Share2 className="h-[18px] w-[18px]" />
          </ShareButton>
        )}
        <ShareButton
          label="WhatsApp"
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          onClick={() => recordShare("whatsapp")}
          bg="bg-[#25D366]"
          fg="text-white"
          ring="focus-visible:ring-[#25D366]"
        >
          <WhatsAppGlyph />
        </ShareButton>
        <ShareButton
          label="LinkedIn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          onClick={() => recordShare("linkedin")}
          bg="bg-[#0A66C2]"
          fg="text-white"
          ring="focus-visible:ring-[#0A66C2]"
        >
          <Linkedin className="h-[18px] w-[18px]" fill="currentColor" strokeWidth={0} />
        </ShareButton>
        <ShareButton
          label="X"
          href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
          onClick={() => recordShare("x")}
          bg="bg-black"
          fg="text-white"
          ring="focus-visible:ring-black"
        >
          <XGlyph />
        </ShareButton>
        <ShareButton
          label={copied ? "Copied!" : "Copy link"}
          onClick={copyLink}
          bg={copied ? "bg-emerald-100" : "bg-slate-200"}
          fg={copied ? "text-emerald-700" : "text-slate-600"}
          ring="focus-visible:ring-slate-400"
        >
          {copied ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
        </ShareButton>
      </div>
    </div>
  );
}
