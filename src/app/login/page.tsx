"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Cpu, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      await refreshUser();
      router.push("/dashboard");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
      <div className="w-full max-w-[420px] px-4">


        {/* Right side - Login Form */}
        <div className="w-full max-w-[396px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <img
              src="/images/logo.png"
              alt="Computer Repair Management System"
              className="w-40 h-auto mx-auto mb-3 drop-shadow-lg"
            />
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-[#DADDE1] p-6">
            {/* Logo */}
            <div className="text-center mb-5">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-20 h-20 mx-auto mb-3 object-contain"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E] text-center font-medium">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 border border-[#DADDE1] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
                placeholder="อีเมลหรือชื่อผู้ใช้"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-[#DADDE1] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C] pr-12"
                  placeholder="รหัสผ่าน"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#1C1E21] p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0866FF] text-white rounded-lg font-bold text-lg hover:bg-[#0748B3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-[#0866FF] text-sm font-medium hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </form>

            <div className="border-t border-[#DADDE1] mt-5 pt-5 text-center">
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-[#42B72A] text-white rounded-lg font-bold text-base hover:bg-[#36A420] transition-colors"
              >
                สร้างบัญชีใหม่
              </Link>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-[#65676B]">
            <strong>Computer Repair Management System</strong> © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
