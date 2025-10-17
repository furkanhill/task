"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  ArchiveIcon,
  ChartLineIcon,
  ChevronDownIcon,
  Grid2x2Icon,
  Home,
  PlusCircleIcon,
  TagIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  label?: string;
  action?: React.ReactNode;
  items: {
    label: string;
    icon: React.ElementType;
    hasSubMenu?: boolean;
    href?: string;
    badge?: string;
    subMenu?: {
      label: string;
      icon: React.ElementType;
      href: string;
    }[];
  }[];
}

export default function NavMenu() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const adminNavMain: MenuItem[] = [
    {
      label: "ANA MENÜ",
      items: [
        {
          label: "Ana Sayfa",
          href: "/dashboard",
          icon: Home,
        },
        {
          label: "Kullanıcılar",
          hasSubMenu: true,
          icon: ArchiveIcon,
          href: "/dashboard",
          subMenu: [
            {
              label: "Tüm Kullanıcılar",
              href: "/dashboard",
              icon: Home,
            },
            {
              label: "Yeni Kullanıcı Ekle",
              href: "/dashboard/users/new",
              icon: PlusCircleIcon,
            },
          ],
        },
      ],
    },
  ];

  const userNavMain: MenuItem[] = [
    {
      label: "ANA MENÜ",
      items: [
        {
          label: "Profilim",
          href: user?.id ? `/dashboard/users/${user.id}` : "/dashboard",
          icon: Home,
        },
      ],
    },
  ];

  const navMain = isAdmin ? adminNavMain : userNavMain;

  return (
    <>
      {navMain.map((item) => (
    <SidebarGroup key={item.label}>
      <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
      {item.action && (
        <SidebarGroupAction asChild>{item.action}</SidebarGroupAction>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {item.items.map((item, index) => (
            <React.Fragment key={index}>
              {item.hasSubMenu ? (
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <item.icon />
                        <p className="flex-1">{item.label}</p>
                        <ChevronDownIcon className=" size-4" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subMenu?.map((subItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <Button
                              className="w-full shadow-none justify-start bg-transparent text-muted-foreground hover:bg-transparent hover:text-accent-foreground [&>svg]:text-muted-foreground hover:[&>svg]:text-accent-foreground"
                              size="sidebar-submenu"
                              asChild
                            >
                              <Link href={subItem.href}>
                                <subItem.icon />
                                <p className="flex-1">{subItem.label}</p>
                              </Link>
                            </Button>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href!}>
                      <item.icon />
                      <p className="flex-1">{item.label}</p>
                      {item.badge && (
                        <Badge
                          variant="accent"
                          className="size-6 rounded-full font-semibold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
      ))}
    </>
  );
}
