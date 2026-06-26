import html from "@/legal/privacy-policy.html?raw";
import RawHtmlPage from "@/components/raw-html-page";

export default function PrivacyPolicy() {
  return <RawHtmlPage html={html} />;
}
