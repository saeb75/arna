"use client";

import type { AdminUser } from "@glotmate/contracts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatRelative } from "@/lib/labels";
import { fadeUp } from "@/lib/motion";

export function UserDetailHeader({ user }: { user: AdminUser }) {
  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();
  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
      <Link href="/users" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Users
      </Link>
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">{initial}</span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {user.displayName ?? user.email ?? "Unnamed account"}
            {user.isAdmin && <Badge>Admin</Badge>}
            {!user.hasProfile && <Badge variant="outline">Not onboarded</Badge>}
          </h1>
          {user.displayName && <p className="text-sm text-muted-foreground">{user.email}</p>}
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">{user.id}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Joined {formatDateTime(user.createdAt)}
            {user.lastSignInAt ? ` · last sign-in ${formatRelative(user.lastSignInAt)}` : " · never signed in"}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
