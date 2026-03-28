// app/api/tasks/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { z, type ZodIssue } from 'zod';

const CheckItemSchema = z.object({
  text: z.string().min(1),
  completed: z.boolean().optional(),
  order: z.number().optional(),
});

const TaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.string().optional().default("todo"),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().nullable().optional(),
  creatorId: z.string().nullable().optional(),
  checkItems: z.array(CheckItemSchema).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let validation;
    try {
      validation = TaskSchema.safeParse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!validation.success) {
      const errors = (validation.error.issues ?? []).map((issue: ZodIssue) => ({
        field: (issue.path || []).join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { title, description, status, projectId, assigneeId } = validation.data;

    // Verifikasi session & akses project
    const session = await getServerSession(getAuthOptions());
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some(m => m.userId === userId);
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Cek assignee jika disediakan
    if (assigneeId) {
      const userExists = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!userExists) {
        return NextResponse.json(
          { error: "Assignee user not found" },
          { status: 404 }
        );
      }
    }

    // Prevent duplicate task title in the same project
    const existing = await prisma.task.findFirst({
      where: { projectId, title },
    });
    if (existing) {
      return NextResponse.json({ error: 'Task with same title already exists' }, { status: 409 });
    }

    // Buat task (dan checkItems jika ada)
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: userId,
        checkItems: validation.data.checkItems
          ? {
              create: validation.data.checkItems.map((c) => ({
                text: c.text,
                completed: c.completed ?? false,
                order: c.order ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        checkItems: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });

  } catch (error: unknown) {
    console.error("Failed to create task:", error);
    if (error instanceof Error && 'code' in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid foreign key constraint" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to create task",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

