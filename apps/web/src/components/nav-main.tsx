"use client";

import { type LucideIcon, type LucideProps } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import type {
  ForwardRefExoticComponent,
  MouseEvent,
  RefAttributes,
} from "react";

type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isExternal: boolean;
  isActive?: boolean;
  scrollTargetId?: string;
};

export function NavMain({
  items,
  team,
}: {
  items: NavMainItem[];
  team: {
    name: string;
    logo: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    plan: string;
  };
}) {
  const handleItemClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: NavMainItem,
  ) => {
    if (!item.scrollTargetId) {
      return;
    }

    const target = document.getElementById(item.scrollTargetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", item.url);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{team.name}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              tooltip={item.title}
            >
              <Link
                href={item.url}
                target={item.isExternal ? "_blank" : undefined}
                onClick={(event) => handleItemClick(event, item)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
