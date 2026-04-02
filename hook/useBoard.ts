"use client";
import { useState, useEffect } from "react";
keren keren keren
export type Board = {
  id: string
  name: string;
  ownerId?: string;
};

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial fetch from API
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch("/api/projects");
        const data: Board[] = await res.json();
        setBoards(data ?? []);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoards();
  }, []);

  // Add board via API
  async function addBoard(name: string) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
        }),
      });

      const newBoard: Board = await res.json();
      if (!res.ok) throw new Error((newBoard as any).error || "Failed to add project");
      setBoards((prev) => [...prev, newBoard]);
    } catch (err: any) {
      console.error("Add board error:", err?.message ?? err);
    }
  }

  return { boards, addBoard, loading };
}
