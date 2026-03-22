import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's repository connections
    const connections = await prisma.repositoryConnection.findMany({
      where: { userId: session.user.id },
    });

    const status = {
      github: {
        connected: connections.some(c => c.provider === 'github'),
        username: connections.find(c => c.provider === 'github')?.scope || undefined,
      },
      gitlab: {
        connected: connections.some(c => c.provider === 'gitlab'),
        username: connections.find(c => c.provider === 'gitlab')?.scope || undefined,
      },
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Get connections status error:', error);
    return NextResponse.json({ error: 'Failed to get connections status' }, { status: 500 });
  }
}
