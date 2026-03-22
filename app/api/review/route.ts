import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, type, status, notes, channel, recipientEmail } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // Verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { members: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isOwner = task.project.ownerId === session.user.id;
    const isMember = task.project.members.some(m => m.userId === session.user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create review request
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        taskId,
        type: type || 'self',
        status: status || 'pending',
        notes,
      },
    });

    // If sending to tester, send notification
    if (type === 'tester' && channel && recipientEmail) {
      // Notification would be sent here via the notification service
      // For now, just log it
      console.log(`Would send notification to ${recipientEmail} via ${channel}`);
    }

    return NextResponse.json(reviewRequest, { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, status, notes } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
    }

    // Update task status based on review
    if (status === 'approved') {
      // Move task to done
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'done' },
      });
    } else if (status === 'rejected') {
      // Move task back to in-progress
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'in-progress' },
      });
    }

    // Create review record
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        taskId,
        type: 'manual',
        status,
        notes,
      },
    });

    return NextResponse.json(reviewRequest);
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const reviews = await prisma.reviewRequest.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to get reviews' }, { status: 500 });
  }
}
