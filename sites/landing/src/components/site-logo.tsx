import Image from "next/image";
import Link from "next/link";

import icon from "@/assets/icon.png";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.brand}, home`}
      className={cn(
        "inline-flex items-center gap-2.5 text-[1.05rem] font-extrabold tracking-tight transition-opacity active:opacity-70",
        className,
      )}
    >
      <Image
        src={icon}
        alt=""
        width={34}
        height={34}
        className="size-[34px] rounded-[10px] shadow-[0_4px_14px_-4px_rgb(229_72_74/0.55)]"
      />
      <span>
        Glot<span className="text-brand">Mate</span>
      </span>
    </Link>
  );
}
