import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const computer = await prisma.computer.findUnique({
      where: { id },
      include: {
        department: true,
        repairs: {
          include: {
            technician: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { repairs: true } },
      },
    });

    if (!computer) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูล Computer" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: computer });
  } catch (error) {
    console.error("Get computer error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if asset code is taken by another computer
    if (body.assetCode) {
      const existing = await prisma.computer.findFirst({
        where: { assetCode: body.assetCode, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Asset Code นี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }

    const computer = await prisma.computer.update({
      where: { id },
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
        status: body.status,
        remark: body.remark || null,
      },
    });

    return NextResponse.json({ data: computer, success: true });
  } catch (error) {
    console.error("Update computer error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" },
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

    // Check if computer has repairs
    const repairCount = await prisma.repair.count({
      where: { computerId: id },
    });

    if (repairCount > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบ Computer ที่มีรายการซ่อมได้" },
        { status: 400 }
      );
    }

    await prisma.computer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete computer error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}
