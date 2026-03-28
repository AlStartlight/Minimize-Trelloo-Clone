// types.ts

export interface User {
  id: string;
  email: string;
  name?: string | null;
  password: string;
  ownedProjects: Project[];
  assignedTasks: Task[];
  createdTasks: Task[];
  memberships: Membership[];
  role?: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  expires: string;
}

export interface Suggestion {
  id: string;
  name: string;
  email: string;
}
export interface Project {
  id: string;
  name: string;
  ownerId: string;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  members: Membership[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  project: Project;
  assigneeId?: string | null;
  assignedTo?: User | null;
  creatorId?: string | null;
  creator?: User | null;
  checkItems?: {
    id: string;
    text: string;
    completed: boolean;
    order: number;
  }[];
  status: string; // could be: "pending", "in_progress", "done" etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  user: User;
  projectId: string;
  project: Project;
  role: string; // could be "owner", "member", "admin", etc.
  createdAt: Date;
  updatedAt: Date;
}
