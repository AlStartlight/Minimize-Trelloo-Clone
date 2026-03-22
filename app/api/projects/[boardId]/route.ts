import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: boardId },
    include: {
      members: true,
      owner: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isOwner = project.ownerId === userId;
  const isMember = project.members.some((m) => m.userId === userId);

  if (!isOwner && !isMember) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json(project);
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
    const { boardId } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.length < 3) {
        return NextResponse.json({ error: 'Invalid project name' }, { status: 400 });
    }

    try {
        const updatedProject = await prisma.project.update({
            where: { id: boardId },
            data: { name },
        });
        return NextResponse.json(updatedProject);
    } catch {
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}