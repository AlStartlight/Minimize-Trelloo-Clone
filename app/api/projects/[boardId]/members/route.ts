// app/api/projects/[projectId]/members/route.ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId: projectId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { email, role = "member" } = await req.json();

  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized or missing email" }, { status: 401 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });
  if (!project || project.ownerId !== userId) {
    return NextResponse.json({ error: "You are not the owner" }, { status: 403 });
  }

  const member = await prisma.membership.upsert({
    where: {
      userId_projectId: {
        userId: targetUser.id,
        projectId,
      },
    },
    update: { role },
    create: {
      userId: targetUser.id,
      projectId,
      role,
    },
  });

  return NextResponse.json(member);
}
