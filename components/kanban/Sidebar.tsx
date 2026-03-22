"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useBoards } from '@/hook/useBoard';
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  Plus,
  ChevronRight,
  Search,
  LogOut,
  Settings,
  User as UserIcon,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Session } from '@/lib/types';

function initials(name?: string | null) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stringToHsl(str?: string) {
  const s = str || "";
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}deg 60% 40%)`;
}

interface SidebarProps {
  session: Session;
}

export default function Sidebar({ session }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { boards, loading } = useBoards();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showBoards, setShowBoards] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: LayoutGrid, label: 'Boards', href: '/dashboard', onClick: () => setShowBoards(!showBoards) },
  ];

  return (
    <aside
      className={cn(
        "h-screen flex flex-col sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-sidebar-border">
        {!isCollapsed && (
          <span className="font-bold text-lg text-sidebar-foreground">Treeloo</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {/* Main Nav Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href && !showBoards && item.label === 'Home';
            
            return (
              <div key={item.label}>
                {item.label === 'Boards' && !isCollapsed && (
                  <button
                    onClick={() => setShowBoards(!showBoards)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sidebar-foreground uppercase tracking-wider hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <span>Boards</span>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showBoards && "rotate-90")} />
                  </button>
                )}
                {item.label !== 'Boards' && (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Boards List */}
        {showBoards && (
          <div className="mt-4">
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Workspaces</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => router.push('/dashboard')}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {isCollapsed ? (
              <div className="space-y-1">
                {boards.slice(0, 5).map((b) => (
                  <Link key={b.id} href={`/dashboard/${b.id}`}>
                    <div
                      className={cn(
                        "w-10 h-10 mx-auto rounded-md flex items-center justify-center cursor-pointer transition-all",
                        "hover:opacity-80",
                        pathname === `/dashboard/${b.id}` && "ring-2 ring-primary"
                      )}
                      style={{ backgroundColor: stringToHsl(b.name) }}
                      title={b.name}
                    >
                      <span className="text-white text-sm font-semibold">
                        {initials(b.name)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {loading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
                )}
                {!loading && boards.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No boards yet</div>
                )}
                {boards.map((b) => (
                  <Link key={b.id} href={`/dashboard/${b.id}`}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-sidebar-accent",
                        pathname === `/dashboard/${b.id}` && "bg-sidebar-accent"
                      )}
                    >
                      <div
                        className="h-7 w-7 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: stringToHsl(b.name) }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {initials(b.name)}
                        </span>
                      </div>
                      <span className="text-sm truncate text-sidebar-foreground">{b.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Search (when collapsed) */}
        {isCollapsed && (
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 mt-2 text-sidebar-foreground hover:bg-sidebar-accent"
              title="Search boards"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="space-y-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {initials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {/* Collapsed Profile */}
        {isCollapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-10 mt-1 text-sidebar-foreground hover:bg-sidebar-accent">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
