import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Add a part to a repair
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repairId, partId, quantity, price } = body;

    if (!repairId || !partId || !quantity) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part) {
      return NextResponse.json({ error: "ไม่พบอะไหล่" }, { status: 404 });
    }

    if (part.stock < quantity) {
      return NextResponse.json(
        { error: `-stock ไม่เพียงพอ (เหลือ ${part.stock} ${part.unit || "ชิ้น"})` },
        { status: 400 }
      );
    }

    const unitPrice = price || part.price;
    const total = unitPrice * quantity;

    const repairPart = await prisma.$transaction(async (tx) => {
      const rp = await tx.repairPart.create({
        data: {
          repairId,
          partId,
          quantity,
          price: unitPrice,
          total,
        },
        include: { part: true },
      });

      // Deduct stock
      await tx.part.update({
        where: { id: partId },
        data: { stock: { decrement: quantity } },
      });

      return rp;
    });

    return NextResponse.json({ data: repairPart, success: true });
  } catch (error) {
    console.error("Add repair part error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มอะไหล่" },
      { status: 500 }
    );
  }
}

// List parts for a repair
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get("repairId");

    if (!repairId) {
      return NextResponse.json(
        { error: "กรุณาระบุ Repair ID" },
        { status: 400 }
      );
    }

    const parts = await prisma.repairPart.findMany({
      where: { repairId },
      include: { part: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: parts });
  } catch (error) {
    console.error("Get repair parts error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
