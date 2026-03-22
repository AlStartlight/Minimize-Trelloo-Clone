import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Check if user is a member
    const membership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const members = await prisma.membership.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to get members:", error);
    return NextResponse.json(
      { error: "Failed to get members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, email, role = "developer" } = body;

    if (!projectId || !email) {
      return NextResponse.json(
        { error: "projectId and email are required" },
        { status: 400 }
      );
    }

    // Check if current user is owner
    const currentMembership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can invite members" },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 409 }
      );
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        projectId,
        role: role as Role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the new member
    await prisma.notification.create({
      data: {
        userId: user.id,
        projectId,
        type: "member_joined",
        title: "Added to Project",
        message: `You have been added to a project as ${role}`,
        data: JSON.stringify({ projectId, role }),
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Failed to add member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, userId, role } = body;

    if (!projectId || !userId || !role) {
      return NextResponse.json(
        { error: "projectId, userId, and role are required" },
        { status: 400 }
      );
    }

    // Check if current user is owner
    const currentMembership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can change member roles" },
        { status: 403 }
      );
    }

    // Can't change own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Update role
    const membership = await prisma.membership.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the member
    await prisma.notification.create({
      data: {
        userId,
        projectId,
        type: "role_changed",
        title: "Role Updated",
        message: `Your role has been changed to ${role}`,
        data: JSON.stringify({ projectId, role }),
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    console.error("Failed to update member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const userId = url.searchParams.get("userId");

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "projectId and userId are required" },
        { status: 400 }
      );
    }

    // Check if current user is owner
    const currentMembership = await prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can remove members" },
        { status: 403 }
      );
    }

    // Can't remove self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    // Remove membership
    await prisma.membership.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    // Create notification for the removed member
    await prisma.notification.create({
      data: {
        userId,
        projectId,
        type: "member_removed",
        title: "Removed from Project",
        message: "You have been removed from a project",
        data: JSON.stringify({ projectId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
