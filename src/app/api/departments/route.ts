import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, computers: true, repairs: true } },
      },
    });

    return NextResponse.json({ data: departments });
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const existing = await prisma.department.findUnique({
      where: { code: body.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Department Code นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      },
    });

    return NextResponse.json({ data: department, success: true });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}
