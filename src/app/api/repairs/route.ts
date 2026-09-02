import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateRepairNo } from "@/lib/utils";

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
    const problemType = searchParams.get("problemType") || "";
    const technicianId = searchParams.get("technicianId") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const computerBrand = searchParams.get("computerBrand") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { repairNo: { contains: search, mode: "insensitive" } },
        { requesterName: { contains: search, mode: "insensitive" } },
        { problemDescription: { contains: search, mode: "insensitive" } },
        { computer: { assetCode: { contains: search, mode: "insensitive" } } },
        { computer: { computerName: { contains: search, mode: "insensitive" } } },
        { computer: { serialNumber: { contains: search, mode: "insensitive" } } },
        { technician: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (problemType) where.problemType = problemType;
    if (technicianId) where.technicianId = technicianId;
    if (departmentId) where.departmentId = departmentId;

    if (startDate || endDate) {
      where.createdAt = {};
      const dateFilter = where.createdAt as Record<string, Date>;
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    if (computerBrand) {
      where.computer = {
        ...(where.computer as Record<string, unknown>),
        brand: { contains: computerBrand, mode: "insensitive" },
      };
    }

    // Technician can only see their own repairs
    if (session.role === "TECHNICIAN") {
      where.technicianId = session.userId;
    }

    const [data, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        include: {
          computer: { select: { id: true, assetCode: true, computerName: true, brand: true, model: true } },
          department: { select: { id: true, name: true, code: true } },
          technician: { select: { id: true, name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.repair.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Get repairs error:", error);
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

    const repairNo = generateRepairNo();

    const repair = await prisma.repair.create({
      data: {
        repairNo,
        computerId: body.computerId || null,
        requesterName: body.requesterName,
        departmentId: body.departmentId || null,
        location: body.location || null,
        problemDescription: body.problemDescription,
        problemType: body.problemType,
        priority: body.priority || "MEDIUM",
        technicianId: body.technicianId || null,
        cost: body.cost ? parseFloat(body.cost) : null,
        remark: body.remark || null,
        status: body.technicianId ? "ASSIGNED" : "WAITING",
        receivedAt: new Date(),
      },
      include: {
        computer: true,
        department: true,
        technician: { select: { id: true, name: true } },
      },
    });

    // Create status history
    await prisma.repairStatusHistory.create({
      data: {
        repairId: repair.id,
        status: body.technicianId ? "ASSIGNED" : "WAITING",
        description: "สร้างรายการซ่อมใหม่",
        changedBy: session.userId,
      },
    });

    // If computer is assigned, update its status
    if (body.computerId) {
      await prisma.computer.update({
        where: { id: body.computerId },
        data: { status: "REPAIR" },
      });
    }

    return NextResponse.json({ data: repair, success: true });
  } catch (error) {
    console.error("Create repair error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างรายการซ่อม" },
      { status: 500 }
    );
  }
}
