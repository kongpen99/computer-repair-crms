import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    const department = await prisma.department.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      },
    });

    return NextResponse.json({ data: department, success: true });
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
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

    const hasUsers = await prisma.user.count({ where: { departmentId: id } });
    const hasComputers = await prisma.computer.count({ where: { departmentId: id } });

    if (hasUsers > 0 || hasComputers > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบ Department ที่มีผู้ใช้งานหรือ Computer ได้" },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
