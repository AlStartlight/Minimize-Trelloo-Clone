"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task, Project, User } from "@/lib/types";
import { PlusIcon, CheckSquare, Eye, Edit2, Search, LayoutGrid, Users, Wifi, WifiOff } from "lucide-react";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import InviteMemberDialog from "./upBoard/InviteMemberDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "./NotificationBell";
import { useSocket } from "@/hooks/useSocket";

const columns = [
  { id: "todo", title: "To-Do", color: "bg-slate-400" },
  { id: "in-progress", title: "In Progress", color: "bg-amber-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-emerald-500" },
];

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

interface Session {
  user?: SessionUser;
}

export default function KanbanDashboard({
  children,
  session,
}: {
  children?: React.ReactNode;
  session?: Session;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [checklist, setChecklist] = useState<{ text: string; completed?: boolean }[]>([]);
  const [checklistInput, setChecklistInput] = useState("");
  const [newCheckInput, setNewCheckInput] = useState("");
  const [status, setStatus] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogMail, setOpenDialogMail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const params = useParams();
  const boardId = params.boardId as string;
  const projectId = boardId;
  const [projectDetail, setProjectDetail] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // Socket integration for real-time updates
  const socket = useSocket({
    projectId,
    userId: session?.user?.id,
    onTaskMoved: (data) => {
      // Optimistically update task status
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId ? { ...task, status: data.newStatus } : task
        )
      );
      toast.info("Task moved by another user");
    },
    onTaskCreated: (data) => {
      // Add new task to list
      setTasks((prev) => [data.task, ...prev]);
      toast.info("New task created");
    },
    onTaskUpdated: (data) => {
      // Update task in list
      setTasks((prev) =>
        prev.map((task) => (task.id === data.task.id ? data.task : task))
      );
    },
    onTaskDeleted: (data) => {
      // Remove task from list
      setTasks((prev) => prev.filter((task) => task.id !== data.taskId));
      toast.info("Task deleted");
    },
    onOnlineUsers: (users) => {
      setOnlineUsers(users);
    },
    onNotification: (data) => {
      toast(data.title, {
        description: data.message,
      });
    },
  });

  useEffect(() => {
    async function fetchProjectDetail() {
      setLoading(true);
      try {
        const projectResponse = await fetch(`/api/projects/${boardId}`);
        const projectData = await projectResponse.json();
        setProjectDetail(projectData);

        const usersResponse = await fetch(`/api/users?boardId=${boardId}`);
        const members = await usersResponse.json();
        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetail();
  }, [boardId]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${projectId}`);
      if (!response.ok)
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          projectId,
          assigneeId,
          checkItems: checklist,
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      toast.success("Task created");
      await fetchTasks();
      setOpenDialog(false);
      setTitle("");
      setDescription("");
      setStatus("");
      setChecklist([]);
      setAssigneeId("");
    } catch (error: unknown) {
      console.error("Error creating task:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    }
  };

  const [openViewDialog, setOpenViewDialog] = useState(false);

  const openView = (task: Task) => {
    setSelectedTask(task);
    setOpenViewDialog(true);
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTask) return;
    try {
      const assigneeIdToSend = (selectedTask as { assignedToId?: string; assigneeId?: string }).assignedToId || (selectedTask as { assignedToId?: string; assigneeId?: string }).assigneeId || selectedTask.assignedTo?.id || null;
      const res = await fetch(`/api/tasks/taskdragged/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          status: selectedTask.status,
          assigneeId: assigneeIdToSend,
          checkItems: selectedTask.checkItems ?? [],
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      toast.success("Task updated");
      setOpenEditDialog(false);
      setSelectedTask(null);
      await fetchTasks();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === draggableId
            ? { ...task, status: destination.droppableId }
            : task
        )
      );

      const res = await fetch(`/api/tasks/taskdragged/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });
      if (!res.ok) {
        throw new Error(`Could not update status (${res.status})`);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      {children}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <h1 className="font-semibold text-lg">{projectDetail?.name || 'Loading...'}</h1>
            </div>
            {/* Online Users Indicator */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {socket.isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              {onlineUsers.length > 0 && (
                <span className="flex items-center gap-1 ml-2">
                  <Users className="h-4 w-4" />
                  {onlineUsers.length} online
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="w-48 pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <NotificationBell />
            <ThemeToggle />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDialogMail(true)}
            >
              Members
            </Button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 overflow-auto p-4 trello-bg">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 pb-4 min-h-full">
              {columns.map((column) => (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided) => (
                    <div className="flex flex-col w-72 flex-shrink-0">
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${column.color}`} />
                          <h3 className="font-semibold text-sm">{column.title}</h3>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {filteredTasks.filter((task) => task.status === column.id).length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Column Content */}
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 bg-column-bg rounded-lg p-2 space-y-3 min-h-[500px]"
                      >
                        {loading ? (
                          <div className="flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-card rounded-lg p-3 animate-pulse">
                                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-full"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {filteredTasks
                              .filter((task) => task.status === column.id)
                              .map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-card rounded-lg p-3 cursor-grab transition-all border border-transparent hover:border-border hover:shadow-md ${
                                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                      }`}
                                    >
                                      {/* Task Labels */}
                                      <div className="flex items-center gap-2 mb-2">
                                        {task.checkItems && task.checkItems.length > 0 && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <CheckSquare className="h-3 w-3" />
                                                {task.checkItems.filter(c => c.completed).length}/{task.checkItems.length}
                                              </TooltipTrigger>
                                              <TooltipContent>Checklist progress</TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>

                                      {/* Task Title */}
                                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                        {task.title}
                                      </h4>
                                      
                                      {/* Task Description Preview */}
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}

                                      {/* Task Footer */}
                                      <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                          {task.assignedTo && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                                      {task.assignedTo.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || '?'}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>{task.assignedTo.name || 'Unnamed'}</TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7"
                                            onClick={() => openView(task)}
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7"
                                            onClick={() => openEdit(task)}
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </>
                        )}

                        {/* Add Task Button */}
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-auto py-2"
                              onClick={() => setStatus(column.id)}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add task
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Create New Task</DialogTitle>
                              <DialogDescription>
                                Add a new task to the {column.title} column.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  placeholder="Task title"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label>Checklist</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="New checklist item"
                                    value={checklistInput}
                                    onChange={(e) => setChecklistInput(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    onClick={() => {
                                      if (checklistInput.trim()) {
                                        setChecklist((c) => [...c, { text: checklistInput.trim(), completed: false }]);
                                        setChecklistInput("");
                                      }
                                    }}
                                  >Add</Button>
                                </div>
                                <ul className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                                  {checklist.map((c, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                      <input type="checkbox" checked={!!c.completed} onChange={(e) => {
                                        setChecklist((prev) => prev.map((it, i) => i === idx ? { ...it, completed: e.target.checked } : it));
                                      }} />
                                      <span className="flex-1">{c.text}</span>
                                      <Button variant="ghost" size="sm" onClick={() => setChecklist((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                  id="description"
                                  placeholder="Task description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {columns.map((col) => (
                                      <SelectItem key={col.id} value={col.id}>
                                        {col.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid gap-2">
                                <Label>Assign to</Label>
                                <Select value={assigneeId} onValueChange={setAssigneeId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamMembers.map((member) => (
                                      <SelectItem key={member.id} value={member.id}>
                                        {member.name || member.email}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateTask}>
                                Create Task
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
          
          <InviteMemberDialog boardId={boardId} open={openDialogMail} setOpen={setOpenDialogMail}/>
          
          {/* View Task Dialog */}
          <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTask?.title}</DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="grid gap-4 py-4">
                  {selectedTask.description && (
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-2">Checklist</h4>
                    {selectedTask.checkItems && selectedTask.checkItems.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedTask.checkItems.map((c) => (
                          <li key={c.id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!c.completed} readOnly className="rounded" />
                            <span className={c.completed ? 'line-through text-muted-foreground' : ''}>{c.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No checklist items</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenViewDialog(false)}>Close</Button>
                    <Button onClick={() => { setOpenViewDialog(false); openEdit(selectedTask); }}>Edit</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Edit Task Dialog */}
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Edit Task</DialogTitle>
              </DialogHeader>
              {selectedTask && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={selectedTask.description ?? ''} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Checklist</Label>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {(selectedTask.checkItems ?? []).map((c, idx) => (
                        <li key={c.id} className="flex items-center gap-2">
                          <input type="checkbox" checked={!!c.completed} onChange={(e) => {
                            const next = (selectedTask.checkItems ?? []).map((it, i) => i === idx ? { ...it, completed: e.target.checked } : it);
                            setSelectedTask({ ...selectedTask, checkItems: next });
                          }} className="rounded" />
                          <Input value={c.text} onChange={(e) => {
                            const next = (selectedTask.checkItems ?? []).map((it, i) => i === idx ? { ...it, text: e.target.value } : it);
                            setSelectedTask({ ...selectedTask, checkItems: next });
                          }} className="flex-1" />
                          <Button variant="ghost" size="sm" onClick={() => {
                            const next = (selectedTask.checkItems ?? []).filter((_, i) => i !== idx);
                            setSelectedTask({ ...selectedTask, checkItems: next });
                          }}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Input placeholder="New checklist item" value={newCheckInput} onChange={(e) => setNewCheckInput(e.target.value)} />
                      <Button onClick={() => {
                        if (!newCheckInput.trim()) return;
                        const next = [...(selectedTask.checkItems ?? []), { id: `tmp-${Date.now()}`, text: newCheckInput.trim(), completed: false, order: (selectedTask.checkItems ?? []).length }];
                        setSelectedTask({ ...selectedTask, checkItems: next });
                        setNewCheckInput("");
                      }}>Add</Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setOpenEditDialog(false); setSelectedTask(null); }}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
