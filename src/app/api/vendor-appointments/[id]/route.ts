import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.vendorAppointment.findUnique({
      where: { id },
      include: {
        repair: {
          select: {
            id: true,
            repairNo: true,
            problemDescription: true,
            problemType: true,
            priority: true,
            status: true,
            computer: { select: { assetCode: true, computerName: true } },
            technician: { select: { name: true } },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
    }

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.vendorName !== undefined) data.vendorName = body.vendorName;
    if (body.contactPerson !== undefined) data.contactPerson = body.contactPerson;
    if (body.contactPhone !== undefined) data.contactPhone = body.contactPhone;
    if (body.serviceType !== undefined) data.serviceType = body.serviceType;
    if (body.appointmentDate !== undefined) data.appointmentDate = new Date(body.appointmentDate);
    if (body.appointmentTime !== undefined) data.appointmentTime = body.appointmentTime;
    if (body.status !== undefined) data.status = body.status;
    if (body.cost !== undefined) data.cost = body.cost ? Number(body.cost) : null;
    if (body.repairId !== undefined) data.repairId = body.repairId || null;
    if (body.remark !== undefined) data.remark = body.remark;

    const appointment = await prisma.vendorAppointment.update({
      where: { id },
      data,
      include: {
        repair: { select: { repairNo: true } },
      },
    });

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vendorAppointment.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
