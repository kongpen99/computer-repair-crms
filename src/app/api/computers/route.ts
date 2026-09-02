import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { assetCode: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
        { computerName: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { assignedUser: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [data, total] = await Promise.all([
      prisma.computer.findMany({
        where,
        include: {
          department: true,
          _count: { select: { repairs: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.computer.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Get computers error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check duplicate asset code
    const existing = await prisma.computer.findUnique({
      where: { assetCode: body.assetCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Asset Code นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const computer = await prisma.computer.create({
      data: {
        assetCode: body.assetCode,
        serialNumber: body.serialNumber || null,
        computerName: body.computerName || null,
        brand: body.brand || null,
        model: body.model || null,
        cpu: body.cpu || null,
        ram: body.ram || null,
        storage: body.storage || null,
        operatingSystem: body.operatingSystem || null,
        ipAddress: body.ipAddress || null,
        macAddress: body.macAddress || null,
        departmentId: body.departmentId || null,
        location: body.location || null,
        assignedUser: body.assignedUser || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        status: body.status || "NORMAL",
        remark: body.remark || null,
      },
    });

    return NextResponse.json({ data: computer, success: true });
  } catch (error) {
    console.error("Create computer error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}
