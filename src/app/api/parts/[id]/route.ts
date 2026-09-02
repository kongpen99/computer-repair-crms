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
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        repairParts: {
          include: {
            repair: {
              select: { id: true, repairNo: true, problemDescription: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!part) {
      return NextResponse.json({ error: "ไม่พบข้อมูลอะไหล่" }, { status: 404 });
    }

    return NextResponse.json({ data: part });
  } catch (error) {
    console.error("Get part error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
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

    // Check if part code is taken by another part
    if (body.partCode) {
      const existing = await prisma.part.findFirst({
        where: { partCode: body.partCode, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Part Code นี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }

    const part = await prisma.part.update({
      where: { id },
      data: {
        partCode: body.partCode,
        name: body.name,
        category: body.category || null,
        brand: body.brand || null,
        model: body.model || null,
        stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
        minimumStock: body.minimumStock !== undefined ? parseInt(body.minimumStock) : undefined,
        unit: body.unit || null,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        supplier: body.supplier || null,
        remark: body.remark || null,
      },
    });

    return NextResponse.json({ data: part, success: true });
  } catch (error) {
    console.error("Update part error:", error);
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

    // Check if part has been used in repairs
    const repairPartCount = await prisma.repairPart.count({
      where: { partId: id },
    });

    if (repairPartCount > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบอะไหล่ที่เคยใช้งานแล้วได้" },
        { status: 400 }
      );
    }

    await prisma.part.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete part error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}
