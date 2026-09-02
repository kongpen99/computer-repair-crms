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
    const category = searchParams.get("category") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { partCode: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Note: lowStock filtering is handled after query since Prisma can't compare columns directly

    const [data, total] = await Promise.all([
      prisma.part.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.part.count({ where }),
    ]);

    // Get low stock parts (filter in code since Prisma can't compare columns)
    const allParts = await prisma.part.findMany({
      select: { id: true, partCode: true, name: true, stock: true, minimumStock: true },
    });
    const lowStockParts = allParts.filter((p) => p.stock <= p.minimumStock);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      lowStockParts,
    });
  } catch (error) {
    console.error("Get parts error:", error);
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

    // Check duplicate part code
    const existing = await prisma.part.findUnique({
      where: { partCode: body.partCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Part Code นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const part = await prisma.part.create({
      data: {
        partCode: body.partCode,
        name: body.name,
        category: body.category || null,
        brand: body.brand || null,
        model: body.model || null,
        stock: body.stock ? parseInt(body.stock) : 0,
        minimumStock: body.minimumStock ? parseInt(body.minimumStock) : 0,
        unit: body.unit || null,
        price: body.price ? parseFloat(body.price) : 0,
        supplier: body.supplier || null,
        remark: body.remark || null,
      },
    });

    return NextResponse.json({ data: part, success: true });
  } catch (error) {
    console.error("Create part error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" },
      { status: 500 }
    );
  }
}
