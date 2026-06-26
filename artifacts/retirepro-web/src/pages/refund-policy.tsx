import html from "@/legal/refund-policy.html?raw";
import RawHtmlPage from "@/components/raw-html-page";

export default function RefundPolicy() {
  return <RawHtmlPage html={html} />;
}
