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
    const type = searchParams.get("type") || "repairs";

    if (type === "repairs") {
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }

      const where = startDate || endDate ? { createdAt: dateFilter } : {};

      const [
        totalRepairs,
        statusCounts,
        problemTypeCounts,
        monthlyRepairs,
        departmentCounts,
        technicianCounts,
      ] = await Promise.all([
        prisma.repair.count({ where }),
        prisma.repair.groupBy({
          by: ["status"],
          _count: true,
          where,
        }),
        prisma.repair.groupBy({
          by: ["problemType"],
          _count: true,
          where,
        }),
        prisma.repair.groupBy({
          by: ["createdAt"],
          _count: true,
          where,
          orderBy: { createdAt: "asc" },
        }),
        prisma.repair.groupBy({
          by: ["departmentId"],
          _count: true,
          where,
          orderBy: { _count: { departmentId: "desc" } },
        }),
        prisma.repair.groupBy({
          by: ["technicianId"],
          _count: true,
          where: { ...where, technicianId: { not: null } },
          orderBy: { _count: { technicianId: "desc" } },
        }),
      ]);

      // Get department names
      const deptIds = departmentCounts.map((d) => d.departmentId).filter(Boolean) as string[];
      const departments = await prisma.department.findMany({
        where: { id: { in: deptIds } },
        select: { id: true, name: true },
      });
      const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

      // Get technician names
      const techIds = technicianCounts.map((t) => t.technicianId).filter(Boolean) as string[];
      const technicians = await prisma.user.findMany({
        where: { id: { in: techIds } },
        select: { id: true, name: true },
      });
      const techMap = Object.fromEntries(technicians.map((t) => [t.id, t.name]));

      return NextResponse.json({
        data: {
          totalRepairs,
          statusCounts: statusCounts.map((s) => ({
            status: s.status,
            count: s._count,
          })),
          problemTypeCounts: problemTypeCounts.map((p) => ({
            problemType: p.problemType,
            count: p._count,
          })),
          monthlyRepairs: monthlyRepairs.map((m) => ({
            date: m.createdAt,
            count: m._count,
          })),
          departmentCounts: departmentCounts.map((d) => ({
            departmentId: d.departmentId,
            departmentName: deptMap[d.departmentId || ""] || "N/A",
            count: d._count,
          })),
          technicianCounts: technicianCounts.map((t) => ({
            technicianId: t.technicianId,
            technicianName: techMap[t.technicianId || ""] || "N/A",
            count: t._count,
          })),
        },
      });
    }

    if (type === "computers") {
      const totalComputers = await prisma.computer.count();
      const statusCounts = await prisma.computer.groupBy({
        by: ["status"],
        _count: true,
      });
      const departmentCounts = await prisma.computer.groupBy({
        by: ["departmentId"],
        _count: true,
        orderBy: { _count: { departmentId: "desc" } },
      });

      const deptIds = departmentCounts.map((d) => d.departmentId).filter(Boolean) as string[];
      const departments = await prisma.department.findMany({
        where: { id: { in: deptIds } },
        select: { id: true, name: true },
      });
      const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

      // Most repaired computers
      const mostRepaired = await prisma.computer.findMany({
        select: {
          id: true,
          assetCode: true,
          computerName: true,
          brand: true,
          _count: { select: { repairs: true } },
        },
        orderBy: { repairs: { _count: "desc" } },
        take: 10,
        where: { repairs: { some: {} } },
      });

      return NextResponse.json({
        data: {
          totalComputers,
          statusCounts: statusCounts.map((s) => ({
            status: s.status,
            count: s._count,
          })),
          departmentCounts: departmentCounts.map((d) => ({
            departmentId: d.departmentId,
            departmentName: deptMap[d.departmentId || ""] || "N/A",
            count: d._count,
          })),
          mostRepaired: mostRepaired.map((c) => ({
            ...c,
            repairCount: c._count.repairs,
          })),
        },
      });
    }

    if (type === "cost") {
      const totalCost = await prisma.repair.aggregate({
        _sum: { cost: true },
        where: { cost: { not: null } },
      });

      const totalPartCost = await prisma.repairPart.aggregate({
        _sum: { total: true },
      });

      const monthlyCost = await prisma.repair.groupBy({
        by: ["createdAt"],
        _sum: { cost: true },
        _count: true,
        where: { cost: { not: null } },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({
        data: {
          totalRepairCost: totalCost._sum.cost || 0,
          totalPartCost: totalPartCost._sum.total || 0,
          grandTotal: (totalCost._sum.cost || 0) + (totalPartCost._sum.total || 0),
          monthlyCost: monthlyCost.map((m) => ({
            date: m.createdAt,
            cost: m._sum.cost || 0,
            count: m._count,
          })),
        },
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงรายงาน" },
      { status: 500 }
    );
  }
}
