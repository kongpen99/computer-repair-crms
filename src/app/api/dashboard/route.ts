import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalComputers,
      totalRepairs,
      waitingCount,
      repairingCount,
      completedCount,
      returnedCount,
      currentMonthRepairs,
      computersWithRepairs,
      statusCounts,
      problemTypeCounts,
      monthlyRepairs,
      recentRepairs,
    ] = await Promise.all([
      prisma.computer.count(),
      prisma.repair.count(),
      prisma.repair.count({ where: { status: "WAITING" } }),
      prisma.repair.count({ where: { status: "REPAIRING" } }),
      prisma.repair.count({ where: { status: "COMPLETED" } }),
      prisma.repair.count({ where: { status: "RETURNED" } }),
      prisma.repair.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.computer.findMany({
        where: { repairs: { some: { status: { in: ["WAITING", "ASSIGNED", "DIAGNOSING", "REPAIRING", "WAITING_PART"] } } } },
        select: { id: true },
      }),
      prisma.repair.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.repair.groupBy({
        by: ["problemType"],
        _count: true,
      }),
      prisma.repair.groupBy({
        by: ["createdAt"],
        _count: true,
        orderBy: { createdAt: "asc" },
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
      }),
      prisma.repair.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          computer: { select: { assetCode: true, computerName: true } },
          technician: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        totalComputers,
        totalRepairs,
        waitingCount,
        repairingCount,
        completedCount,
        returnedCount,
        currentMonthRepairs,
        problemComputerCount: computersWithRepairs.length,
        statusCounts: statusCounts.map((s) => ({
          status: s.status,
          count: s._count,
        })),
        problemTypeCounts: problemTypeCounts.map((p) => ({
          problemType: p.problemType,
          count: p._count,
        })),
        monthlyRepairs: monthlyRepairs.map((m) => ({
          date: m.createdAt.toISOString(),
          count: m._count,
        })),
        recentRepairs,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
