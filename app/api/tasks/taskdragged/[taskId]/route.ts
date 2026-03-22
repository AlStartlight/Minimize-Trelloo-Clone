// app/api/tasks/[taskId]/route.ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  // 1. Verifikasi session
  const session = await getServerSession(getAuthOptions());
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Ambil body (bisa berisi banyak field untuk update)
  const body = await req.json();
  const { status, title, description, assigneeId, checkItems } = body;

  // 3. Temukan task dan project-nya
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // 4. Cek akses: harus owner atau member project
  const project = task.project;
  const isOwner = project.ownerId === userId;
  const isMember = project.members.some(m => m.userId === userId);
  if (!isOwner && !isMember) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // 5. Update task fields
  try {
    const data: Record<string, string | null> = {};
    if (typeof title === 'string') data.title = title;
    if (typeof description === 'string') data.description = description;
    if (typeof status === 'string') data.status = status;
    if (typeof assigneeId === 'string' || assigneeId === null) data.assigneeId = assigneeId;

    await prisma.task.update({
      where: { id: taskId },
      data,
      include: { checkItems: true },
    });

    // If checkItems provided, replace existing items
    if (Array.isArray(checkItems)) {
      await prisma.taskCheckItem.deleteMany({ where: { taskId } });
      if (checkItems.length > 0) {
        await prisma.taskCheckItem.createMany({
          data: checkItems.map((c: { text?: string; completed?: boolean; order?: number }, idx: number) => ({
            taskId,
            text: String(c.text || ''),
            completed: Boolean(c.completed || false),
            order: typeof c.order === 'number' ? c.order : idx,
          })),
        });
      }
    }

    const refreshed = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        checkItems: { orderBy: { order: 'asc' } },
        project: { include: { members: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json(refreshed);
  } catch (err: unknown) {
    console.error('Failed to update task status:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
