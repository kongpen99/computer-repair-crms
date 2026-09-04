import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      where.appointmentDate = { gte: startDate, lte: endDate };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.vendorAppointment.findMany({
      where,
      include: {
        repair: {
          select: {
            id: true,
            repairNo: true,
            problemDescription: true,
            problemType: true,
            computer: { select: { assetCode: true, computerName: true } },
          },
        },
      },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      vendorName,
      contactPerson,
      contactPhone,
      serviceType,
      appointmentDate,
      appointmentTime,
      cost,
      repairId,
      remark,
    } = body;

    if (!title || !vendorName || !appointmentDate) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลที่จำเป็น (Title, Vendor, Date)" },
        { status: 400 }
      );
    }

    const appointment = await prisma.vendorAppointment.create({
      data: {
        title,
        description,
        vendorName,
        contactPerson,
        contactPhone,
        serviceType: serviceType || "HARDWARE",
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        cost: cost ? Number(cost) : null,
        repairId: repairId || null,
        remark,
      },
      include: {
        repair: {
          select: { repairNo: true },
        },
      },
    });

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
