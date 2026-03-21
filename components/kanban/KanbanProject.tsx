"use client";
import { useBoards } from "@/hook/useBoard";
import type { Board } from "@/hook/useBoard";
import { Button } from "@/components/ui/button";
import { Avatar , AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import  Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, HelpCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Session } from "@/lib/types";

export default function KanbanProject({ session,children }: { session: Session, children?: React.ReactNode }) {
  const { boards, addBoard } = useBoards();
  const [newName, setNewName] = useState("");

  function handleCreate() {
    if (newName.trim()) {
      addBoard(newName.trim(), session.user.id);
      setNewName("");
    }
  }
  
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50 flex">
      {/* Sidebar */}
      {children}
      

      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col gap-8">
        {/* Recently Viewed */}
        <section>
          <div className="font-bold mb-3 text-xl">Recently viewed</div>
          <div className="flex gap-4">
            {boards.slice(-4).reverse().map((b: Board) => (
              <div key={b.id} className="bg-zinc-800 rounded-md w-44 h-20 flex items-end p-2 cursor-pointer hover:bg-zinc-700">
                <div className="font-semibold">{b.name}</div>
              </div>
            ))}
          </div>
        </section>
        {/* Your Workspaces */}
        <section>
          <div className="font-bold mb-3 text-xl">Your Workspaces</div>
          <div className="mb-2 flex items-center gap-2">
            <Avatar className="h-6 w-6 bg-green-500" />
          </div>
          <div className="flex gap-4 flex-wrap">
            {boards.map((b: Board) => (
            <Link  href={`/dashboard/${b.id}`} key={b.id}>
              <div key={b.id} className="bg-zinc-800 rounded-md w-44 h-20 flex items-end p-2 cursor-pointer hover:bg-zinc-700">
                <div className="font-semibold">{b.name}</div>
              </div>
            </Link>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-44 h-20 flex items-center justify-center">Create new board</Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-zinc-900 bg-amber-300">
                <div className="flex flex-col gap-4">
                  <div className="font-bold text-lg">Create Board</div>
                  <Input
                    placeholder="Board name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="dark:text-white text-black"
                  />
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>

      {/* Profile */}
      <div className="absolute top-4 right-6">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Avatar className="h-8 w-8 bg-zinc-700 cursor-pointer hover:bg-zinc-600 transition-colors">
                   <AvatarFallback className="text-white font-medium">
                     {session?.user?.name?.slice(0, 2).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
               </DropdownMenuTrigger>
     
               <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700 text-zinc-200">
                 <DropdownMenuLabel className="flex items-center gap-3">
                   <div className="bg-zinc-700 rounded-full p-2">
                     <User size={16} />
                   </div>
                   <div>
                     <p className="font-medium text-white">{session?.user?.name}</p>
                     <p className="text-xs text-zinc-400">{session?.user?.email}</p>
                   </div>
                 </DropdownMenuLabel>
     
                 <DropdownMenuSeparator className="bg-zinc-700" />
     
                 <DropdownMenuItem className="flex items-center gap-3 hover:bg-zinc-700 cursor-pointer focus:bg-zinc-700">
                   <User size={16} className="text-zinc-400" />
                   <span>Profile</span>
                 </DropdownMenuItem>
     
                 <DropdownMenuItem className="flex items-center gap-3 hover:bg-zinc-700 cursor-pointer focus:bg-zinc-700">
                   <Settings size={16} className="text-zinc-400" />
                   <span>Settings</span>
                 </DropdownMenuItem>
     
                 <DropdownMenuItem className="flex items-center gap-3 hover:bg-zinc-700 cursor-pointer focus:bg-zinc-700">
                   <HelpCircle size={16} className="text-zinc-400" />
                   <span>Help & Support</span>
                 </DropdownMenuItem>
     
                 <DropdownMenuSeparator className="bg-zinc-700" />
     
                 <DropdownMenuItem
                   className="flex items-center gap-3 hover:bg-red-500/10 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                   onClick={() => signOut({ callbackUrl: "/login" })}
                 >
                   <LogOut size={16} />
                   <span>Log out</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
    </div>
  );
}
