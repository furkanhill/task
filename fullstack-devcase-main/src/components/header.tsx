"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  LogOutIcon,
  Menu,
  User,
} from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()
    : 'U';

  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Mobile menu button */}
      <Button
        size="icon"
        variant="ghost"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="size-6" />
      </Button>

      {/* Spacer for alignment */}
      <div className="flex-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-accent"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={fullName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:grid text-left text-sm leading-tight">
              <span className="font-medium">{fullName}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <ChevronDownIcon className="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={fullName} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{fullName}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          {user?.id && (
            <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.id}`)}>
              <User className="mr-2 h-4 w-4" />
              Profilim
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
