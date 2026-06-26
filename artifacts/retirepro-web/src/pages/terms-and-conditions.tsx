import html from "@/legal/terms-and-conditions.html?raw";
import RawHtmlPage from "@/components/raw-html-page";

export default function TermsAndConditions() {
  return <RawHtmlPage html={html} />;
}
