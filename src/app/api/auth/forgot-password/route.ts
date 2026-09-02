import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "กรุณากรอก Email" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "หาก Email นี้มีอยู่ในระบบ จะได้รับรหัส reset password",
      });
    }

    // Invalidate any existing tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code before storing
    const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

    // Store the reset token (expires in 15 minutes)
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // In production, send the code via email
    // For demo purposes, return the code in the response
    console.log(`[Password Reset] Code for ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: "รหัส reset password ถูกส่งไปยัง Email ของคุณแล้ว",
      // In production, remove this line and send via email
      _demo_code: code,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
