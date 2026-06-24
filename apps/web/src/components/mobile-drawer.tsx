import { AuthCtaLink } from "@/components/auth-cta-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";
import { HiPhoneArrowUpRight } from "react-icons/hi2";
import { Layers3 } from "lucide-react";

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <Link
            href="/"
            title="brand-logo"
            className="relative mr-6 flex items-center space-x-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="logo" className="size-8" />
            <DrawerTitle>{siteConfig.name}</DrawerTitle>
          </Link>
          <DrawerDescription>{siteConfig.description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground px-4 text-center">
              Solutions
            </h3>
            <Link
              href="/outbound-sales-call-coaching"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full justify-center w-full"
              )}
            >
              <HiPhoneArrowUpRight className="mr-2 h-4 w-4" />
              Sales Coaching
            </Link>
            <Link
              href="/ragbase"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full justify-center w-full"
              )}
            >
              <Layers3 className="mr-2 h-4 w-4 text-primary" />
              Ragbase
            </Link>
          </div>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
          >
            Pricing
          </Link>
          <a
            href={siteConfig.links.docs}
            className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
          >
            API Docs
          </a>
          <AuthCtaLink
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full group"
            )}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
