import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({ className, variant = "dark", showText = true }: LogoProps) {
  const textColor = variant === "light" ? "#ffffff" : "#0a0a0a";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/brand/logo-mark.svg"
        alt="OCD"
        width={857}
        height={335}
        priority
        unoptimized
        className="h-7 w-auto"
      />
      {showText && (
        <span
          className="font-black tracking-[-0.04em] text-xl"
          style={{ color: textColor }}
        >
          OCD
        </span>
      )}
    </div>
  );
}