import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.username) {
      const existing = await prisma.user.findFirst({
        where: { username: body.username, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Username นี้มีอยู่แล้ว" }, { status: 400 });
      }
      updateData.username = body.username;
    }

    if (body.email) {
      const existing = await prisma.user.findFirst({
        where: { email: body.email, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Email นี้มีอยู่แล้ว" }, { status: 400 });
      }
      updateData.email = body.email;
    }

    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (body.password) {
      updateData.password = await hashPassword(body.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user, success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.userId) {
      return NextResponse.json(
        { error: "ไม่สามารถลบตัวเองได้" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
