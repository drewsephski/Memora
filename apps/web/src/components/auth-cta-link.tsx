"use client";

import { useAuth } from "@/hooks/use-auth";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AuthCtaLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  unauthenticatedHref?: string;
  loggedOutLabel?: ReactNode;
};

export function AuthCtaLink({
  unauthenticatedHref = "/login",
  loggedOutLabel,
  children,
  ...props
}: AuthCtaLinkProps) {
  const { user } = useAuth();

  if (user) {
    return (
      <Link href="/dashboard" {...props}>
        Dashboard
      </Link>
    );
  }

  return (
    <Link href={unauthenticatedHref} {...props}>
      {children ?? loggedOutLabel ?? siteConfig.cta}
    </Link>
  );
}
