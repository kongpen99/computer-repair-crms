import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [computers, repairs, waiting, completed] = await Promise.all([
      prisma.computer.count(),
      prisma.repair.count(),
      prisma.repair.count({ where: { status: "WAITING" } }),
      prisma.repair.count({ where: { status: "COMPLETED" } }),
    ]);

    return NextResponse.json({ computers, repairs, waiting, completed });
  } catch {
    return NextResponse.json({ computers: 0, repairs: 0, waiting: 0, completed: 0 });
  }
}
