"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES, ROLE_COLORS, type Role } from "@/lib/permissions";
import { ChevronDown, UserPlus, Trash2, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MemberListProps {
  projectId: string;
  currentUserId: string;
  currentUserRole: Role;
  members: Member[];
  onMemberUpdate?: () => void;
}

export function MemberList({
  projectId,
  currentUserId,
  currentUserRole,
  members,
  onMemberUpdate,
}: MemberListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("developer");

  const isOwner = currentUserRole === "owner";

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!isOwner) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update role");
      }

      toast.success("Member role updated");
      onMemberUpdate?.();
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!isOwner) return;

    if (userId === currentUserId) {
      toast.error("You cannot remove yourself as the owner");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/members?projectId=${projectId}&userId=${userId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove member");
      }

      toast.success("Member removed");
      onMemberUpdate?.();
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite member");
      }

      toast.success("Member invited successfully");
      setInviteEmail("");
      setInviteRole("developer");
      setOpenInviteDialog(false);
      onMemberUpdate?.();
    } catch (error) {
      console.error("Failed to invite:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite member");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Team Members</h3>
          <span className="text-sm text-muted-foreground">({members.length})</span>
        </div>
        {isOwner && (
          <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your project. They will receive access based on the selected role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RoleSelector
                    currentRole={inviteRole}
                    onRoleChange={setInviteRole}
                    disabled={false}
                  />
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Role Permissions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {ROLES[inviteRole].description}
                  </ul>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Send Invite
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn(
                    "text-sm font-medium",
                    ROLE_COLORS[member.role as Role] || "bg-muted"
                  )}>
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.user.name || "Unnamed"}
                    {member.userId === currentUserId && (
                      <span className="text-muted-foreground ml-1">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    ROLE_COLORS[member.role as Role]
                  )}
                >
                  {ROLES[member.role as Role]?.label || member.role}
                </span>
                {isOwner && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(Object.keys(ROLES) as Role[]).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleRoleChange(member.userId, role)}
                          disabled={member.role === role || isLoading}
                          className={cn(
                            member.role === role && "bg-muted"
                          )}
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            ROLE_COLORS[role].split(" ")[0]
                          )} />
                          {ROLES[role].label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface RoleSelectorProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  disabled?: boolean;
}

export function RoleSelector({ currentRole, onRoleChange, disabled }: RoleSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              ROLE_COLORS[currentRole].split(" ")[0]
            )} />
            {ROLES[currentRole].label}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {(Object.keys(ROLES) as Role[]).map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => onRoleChange(role)}
            className={cn(
              currentRole === role && "bg-muted"
            )}
          >
            <span className={cn(
              "w-2 h-2 rounded-full mr-2",
              ROLE_COLORS[role].split(" ")[0]
            )} />
            <div>
              <p className="font-medium">{ROLES[role].label}</p>
              <p className="text-xs text-muted-foreground">
                {ROLES[role].description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
