import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const users = await prisma.user.findMany({
      take: 20, // ambil banyak dulu
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Filtering manual (karena SQLite nggak support mode insensitive)
    const filteredUsers = users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }).slice(0, 5); // ambil 5 hasil teratas

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
