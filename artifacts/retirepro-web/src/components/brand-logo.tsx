import { Link } from "wouter";
import logoUrl from "@/assets/retirepro-logo.png";

interface BrandLogoProps {
  size?: number;
  textClassName?: string;
  href?: string | null;
  className?: string;
}

export default function BrandLogo({
  size = 32,
  textClassName = "text-slate-900",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const inner = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="RetirePro logo"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      <span className={`text-xl font-bold tracking-tight ${textClassName}`}>RetirePro</span>
    </div>
  );

  if (href === null) {
    return inner;
  }

  return (
    <Link href={href}>
      <div className="inline-flex hover:opacity-80 transition-opacity cursor-pointer">{inner}</div>
    </Link>
  );
}
