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
    const repair = await prisma.repair.findUnique({
      where: { id },
      include: {
        computer: true,
        department: true,
        technician: { select: { id: true, name: true, email: true } },
        histories: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        parts: {
          include: { part: true },
        },
        attachments: true,
      },
    });

    if (!repair) {
      return NextResponse.json({ error: "ไม่พบรายการซ่อม" }, { status: 404 });
    }

    return NextResponse.json({ data: repair });
  } catch (error) {
    console.error("Get repair error:", error);
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

    const existingRepair = await prisma.repair.findUnique({ where: { id } });
    if (!existingRepair) {
      return NextResponse.json({ error: "ไม่พบรายการซ่อม" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.computerId !== undefined) updateData.computerId = body.computerId || null;
    if (body.requesterName !== undefined) updateData.requesterName = body.requesterName;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.problemDescription !== undefined) updateData.problemDescription = body.problemDescription;
    if (body.problemType !== undefined) updateData.problemType = body.problemType;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.cause !== undefined) updateData.cause = body.cause || null;
    if (body.solution !== undefined) updateData.solution = body.solution || null;
    if (body.remark !== undefined) updateData.remark = body.remark || null;

    if (body.cost !== undefined) {
      updateData.cost = body.cost ? parseFloat(body.cost) : null;
    }

    // Handle status change
    if (body.status && body.status !== existingRepair.status) {
      updateData.status = body.status;

      const now = new Date();
      switch (body.status) {
        case "ASSIGNED":
          updateData.technicianId = body.technicianId || session.userId;
          break;
        case "DIAGNOSING":
          updateData.startedAt = now;
          updateData.technicianId = body.technicianId || existingRepair.technicianId;
          break;
        case "REPAIRING":
          updateData.technicianId = body.technicianId || existingRepair.technicianId;
          break;
        case "COMPLETED":
          updateData.completedAt = now;
          break;
        case "RETURNED":
          updateData.returnedAt = now;
          break;
      }

      if (body.technicianId) {
        updateData.technicianId = body.technicianId;
      }

      // Create status history
      await prisma.repairStatusHistory.create({
        data: {
          repairId: id,
          status: body.status,
          description: body.statusDescription || `เปลี่ยนสถานะเป็น ${body.status}`,
          changedBy: session.userId,
        },
      });
    }

    const repair = await prisma.repair.update({
      where: { id },
      data: updateData,
      include: {
        computer: true,
        department: true,
        technician: { select: { id: true, name: true } },
        histories: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Update computer status based on repair status
    if (repair.computerId) {
      if (repair.status === "RETURNED" || repair.status === "COMPLETED") {
        await prisma.computer.update({
          where: { id: repair.computerId },
          data: { status: "NORMAL" },
        });
      }
    }

    return NextResponse.json({ data: repair, success: true });
  } catch (error) {
    console.error("Update repair error:", error);
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

    await prisma.repairAttachment.deleteMany({ where: { repairId: id } });
    await prisma.repairPart.deleteMany({ where: { repairId: id } });
    await prisma.repairStatusHistory.deleteMany({ where: { repairId: id } });
    await prisma.repair.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete repair error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 }
    );
  }
}
