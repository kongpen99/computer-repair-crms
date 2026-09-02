import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, departmentId } = body;

    // Validation
    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน (Username, Email, Password, Name)" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username ต้องมีอย่างน้อย 3 ตัวอักษร" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password ต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบ Email ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Check duplicate username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role: "TECHNICIAN",
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ",
      data: user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
