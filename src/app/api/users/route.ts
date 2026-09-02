import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { assignedRepairs: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const existingUsername = await prisma.user.findUnique({
      where: { username: body.username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        name: body.name,
        role: body.role || "TECHNICIAN",
        departmentId: body.departmentId || null,
      },
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
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" },
      { status: 500 }
    );
  }
}
