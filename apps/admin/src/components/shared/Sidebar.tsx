"use client";

import { BookOpen, MessagesSquare, Settings, Users } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { SidebarNavItem } from "@/components/shared/SidebarNavItem";
import { UserMenu } from "@/components/shared/UserMenu";

const NAV = [
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/users", label: "Users", icon: Users },
  { href: "/sessions", label: "Sessions", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar px-3 py-4">
      <div className="px-2 pb-6">
        <BrandMark />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>
      <UserMenu />
    </aside>
  );
}
