"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface TaskMovedData {
  taskId: string;
  newStatus: string;
  userId: string;
}

interface TaskCreatedData {
  task: any;
  userId: string;
}

interface TaskUpdatedData {
  task: any;
  userId: string;
}

interface TaskDeletedData {
  taskId: string;
  userId: string;
}

interface ReviewRequestedData {
  taskId: string;
  reviewerId: string;
  requestedBy: string;
}

interface ReviewCompletedData {
  taskId: string;
  status: string;
  reviewedBy: string;
}

interface MemberJoinedData {
  userId: string;
  socketId: string;
}

interface MemberLeftData {
  userId: string;
  socketId: string;
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

interface UseSocketOptions {
  projectId?: string;
  userId?: string;
  onTaskMoved?: (data: TaskMovedData) => void;
  onTaskCreated?: (data: TaskCreatedData) => void;
  onTaskUpdated?: (data: TaskUpdatedData) => void;
  onTaskDeleted?: (data: TaskDeletedData) => void;
  onReviewRequested?: (data: ReviewRequestedData) => void;
  onReviewCompleted?: (data: ReviewCompletedData) => void;
  onMemberJoined?: (data: MemberJoinedData) => void;
  onMemberLeft?: (data: MemberLeftData) => void;
  onNotification?: (data: NotificationData) => void;
  onOnlineUsers?: (users: string[]) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const {
    projectId,
    userId,
    onTaskMoved,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onReviewRequested,
    onReviewCompleted,
    onMemberJoined,
    onMemberLeft,
    onNotification,
    onOnlineUsers,
  } = options;

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", socket.id);

      // Join project room if projectId and userId are provided
      if (projectId && userId) {
        socket.emit("join-project", projectId, userId);
        socket.emit("join-user", userId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    // Listen for events
    socket.on("task-moved", (data: TaskMovedData) => {
      onTaskMoved?.(data);
    });

    socket.on("task-created", (data: TaskCreatedData) => {
      onTaskCreated?.(data);
    });

    socket.on("task-updated", (data: TaskUpdatedData) => {
      onTaskUpdated?.(data);
    });

    socket.on("task-deleted", (data: TaskDeletedData) => {
      onTaskDeleted?.(data);
    });

    socket.on("review-requested", (data: ReviewRequestedData) => {
      onReviewRequested?.(data);
    });

    socket.on("review-completed", (data: ReviewCompletedData) => {
      onReviewCompleted?.(data);
    });

    socket.on("member-joined", (data: MemberJoinedData) => {
      onMemberJoined?.(data);
    });

    socket.on("member-left", (data: MemberLeftData) => {
      onMemberLeft?.(data);
    });

    socket.on("notification", (data: NotificationData) => {
      onNotification?.(data);
    });

    socket.on("online-users", (users: string[]) => {
      setOnlineUsers(users);
      onOnlineUsers?.(users);
    });

    return () => {
      if (projectId && userId) {
        socket.emit("leave-project", projectId, userId);
      }
      socket.disconnect();
    };
  }, [projectId, userId]);

  const emitTaskMoved = useCallback((data: { projectId: string; taskId: string; newStatus: string; userId: string }) => {
    socketRef.current?.emit("task-moved", data);
  }, []);

  const emitTaskCreated = useCallback((data: { projectId: string; task: any; userId: string }) => {
    socketRef.current?.emit("task-created", data);
  }, []);

  const emitTaskUpdated = useCallback((data: { projectId: string; task: any; userId: string }) => {
    socketRef.current?.emit("task-updated", data);
  }, []);

  const emitTaskDeleted = useCallback((data: { projectId: string; taskId: string; userId: string }) => {
    socketRef.current?.emit("task-deleted", data);
  }, []);

  const emitReviewRequested = useCallback((data: { projectId: string; taskId: string; reviewerId: string; requestedBy: string }) => {
    socketRef.current?.emit("review-requested", data);
  }, []);

  const emitReviewCompleted = useCallback((data: { projectId: string; taskId: string; status: string; reviewedBy: string }) => {
    socketRef.current?.emit("review-completed", data);
  }, []);

  const emitNotification = useCallback((data: { userId: string; notification: any }) => {
    socketRef.current?.emit("notification", data);
  }, []);

  const joinProject = useCallback((projectId: string, userId: string) => {
    socketRef.current?.emit("join-project", projectId, userId);
  }, []);

  const leaveProject = useCallback((projectId: string, userId: string) => {
    socketRef.current?.emit("leave-project", projectId, userId);
  }, []);

  return {
    isConnected,
    onlineUsers,
    socket: socketRef.current,
    emitTaskMoved,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitReviewRequested,
    emitReviewCompleted,
    emitNotification,
    joinProject,
    leaveProject,
  };
}
