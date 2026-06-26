import html from "@/legal/disclaimer.html?raw";
import RawHtmlPage from "@/components/raw-html-page";

export default function Disclaimer() {
  return <RawHtmlPage html={html} />;
}
