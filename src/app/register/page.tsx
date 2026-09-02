"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Loader2, Eye, EyeOff, UserPlus, CheckCircle, ArrowLeft } from "lucide-react";
import type { DepartmentType } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((json) => setDepartments(json.data || []))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password ไม่ตรงกัน");
      return;
    }

    if (form.password.length < 6) {
      setError("Password ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          name: form.name,
          password: form.password,
          departmentId: form.departmentId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => router.push("/login"), 2000);
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

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-xl border border-[#DADDE1] p-6">
          <div className="mb-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-[#65676B] hover:text-[#1C1E21] mb-3"
            >
              <ArrowLeft size={16} />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
            <h2 className="text-xl font-bold text-[#1C1E21]">สร้างบัญชีใหม่</h2>
            <p className="text-sm text-[#65676B]">กรอกข้อมูลด้านล่างเพื่อสมัครสมาชิก</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E] text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-[#E8F5E9] border border-green-200 rounded-lg text-sm text-[#42B72A] flex items-center justify-center gap-2 font-medium">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
              placeholder="ชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
              required
              minLength={3}
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
              placeholder="อีเมล"
              required
            />

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent placeholder:text-[#90949C]"
              placeholder="ชื่อ-นามสกุล"
              required
            />

            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent text-[#65676B]"
            >
              <option value="">เลือกแผนก (ถ้ามี)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent pr-12 placeholder:text-[#90949C]"
                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
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

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent pr-12 placeholder:text-[#90949C]"
                placeholder="ยืนยันรหัสผ่าน"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#1C1E21] p-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-[#FA3E3E] mt-1">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3 bg-[#0866FF] text-white rounded-lg font-bold text-base hover:bg-[#0748B3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  สมัครสมาชิก
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#DADDE1] mt-5 pt-4 text-center">
            <p className="text-sm text-[#65676B]">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="text-[#0866FF] font-semibold hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
