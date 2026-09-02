"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Loader2, Eye, EyeOff, Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "email" | "code" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      if (data._demo_code) {
        setDemoCode(data._demo_code);
      }

      setStep("code");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password ไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password ใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setStep("success");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] py-8">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/images/logo.png"
            alt="Computer Repair Management System"
            className="w-40 h-auto mx-auto drop-shadow-lg"
          />
        </div>

        {/* Step 1: Enter Email */}
        {step === "email" && (
          <div className="bg-white rounded-xl shadow-xl border border-[#DADDE1] p-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-[#65676B] hover:text-[#1C1E21] mb-3"
            >
              <ArrowLeft size={16} />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>

            <h2 className="text-xl font-bold text-[#1C1E21] mb-1">ลืมรหัสผ่าน?</h2>
            <p className="text-sm text-[#65676B] mb-5">
              กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งรหัส reset password ให้คุณ
            </p>

            {error && (
              <div className="mb-4 p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E] text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-3">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
                  placeholder="กรอกอีเมลที่ลงทะเบียนไว้"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0866FF] text-white rounded-lg font-bold text-base hover:bg-[#0748B3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    ส่งรหัส reset password
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Enter Code & New Password */}
        {step === "code" && (
          <div className="bg-white rounded-xl shadow-xl border border-[#DADDE1] p-6">
            <button
              onClick={() => setStep("email")}
              className="inline-flex items-center gap-1 text-sm text-[#65676B] hover:text-[#1C1E21] mb-3"
            >
              <ArrowLeft size={16} />
              กลับ
            </button>

            <h2 className="text-xl font-bold text-[#1C1E21] mb-1">กรอกรหัส reset password</h2>
            <p className="text-sm text-[#65676B] mb-2">
              เราได้ส่งรหัส 6 หลักไปยัง <strong className="text-[#1C1E21]">{email}</strong>
            </p>

            {demoCode && (
              <div className="mb-4 p-3 bg-[#E7F3FF] border border-[#0866FF]/30 rounded-lg text-sm">
                <p className="text-[#0866FF] font-semibold mb-1">🔑 Reset Code:</p>
                <p className="text-[#1C1E21] text-lg font-mono font-bold tracking-widest">
                  {demoCode}
                </p>
                <p className="text-[#65676B] text-xs mt-1">
                  (ในระบบจริง รหัสนี้จะถูกส่งทาง Email)
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E] text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#1C1E21] mb-1.5">
                  รหัส reset password (6 หลัก)
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent font-mono text-center text-lg tracking-widest"
                    placeholder="000000"
                    required
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1E21] mb-1.5">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#1C1E21] p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1E21] mb-1.5">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-[#FA3E3E] mt-1">รหัสผ่านไม่ตรงกัน</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0866FF] text-white rounded-lg font-bold text-base hover:bg-[#0748B3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังเปลี่ยน Password...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    เปลี่ยนรหัสผ่าน
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="bg-white rounded-xl shadow-xl border border-[#DADDE1] p-8 text-center">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#42B72A]" />
            </div>

            <h2 className="text-xl font-bold text-[#1C1E21] mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
            <p className="text-sm text-[#65676B] mb-6">
              รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-[#0866FF] text-white rounded-lg font-bold text-base hover:bg-[#0748B3] transition-colors flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
