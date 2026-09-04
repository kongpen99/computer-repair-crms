"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Monitor,
  Wrench,
  Clock,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  History,
  Users,
  Building2,
  AlertTriangle,
  Menu,
  X,
  Cpu,
  Search,
  CalendarDays,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Computer",
    icon: <Monitor size={20} />,
    children: [
      { label: "Computer List", href: "/computers", icon: <Monitor size={18} /> },
    ],
  },
  {
    label: "Repair",
    icon: <Wrench size={20} />,
    children: [
      { label: "Repair Jobs", href: "/repairs", icon: <Wrench size={18} /> },
      { label: "Vendor Calendar", href: "/repairs/calendar", icon: <CalendarDays size={18} /> },
      { label: "Repair History", href: "/repairs/history", icon: <History size={18} /> },
    ],
  },
  {
    label: "Spare Parts",
    icon: <Package size={20} />,
    children: [
      { label: "Parts", href: "/parts", icon: <Package size={18} /> },
      { label: "Stock Alert", href: "/parts/low-stock", icon: <AlertTriangle size={18} /> },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart3 size={20} />,
  },
  {
    label: "Settings",
    icon: <Settings size={20} />,
    roles: ["ADMIN"],
    children: [
      { label: "Users", href: "/settings/users", icon: <Users size={18} /> },
      { label: "Departments", href: "/settings/departments", icon: <Building2 size={18} /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Computer", "Repair", "Spare Parts"]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const renderNavItem = (item: NavItem) => {
    if (item.roles && !item.roles.includes(user?.role || "")) {
      return null;
    }

    if (item.children) {
      const isExpanded = expandedItems.includes(item.label);
      const hasActiveChild = item.children.some(
        (child) => child.href && isActive(child.href)
      );

      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors",
              hasActiveChild
                ? "text-[#0866FF] bg-[#E7F3FF]"
                : "text-[#65676B] hover:bg-[#F0F2F5]"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {item.children.map((child) => {
                if (child.roles && !child.roles.includes(user?.role || "")) return null;
                return (
                  <Link
                    key={child.href}
                    href={child.href!}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                      isActive(child.href!)
                        ? "bg-[#0866FF] text-white font-medium"
                        : "text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1C1E21]"
                    )}
                  >
                    <span className="mr-3">{child.icon}</span>
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors",
          isActive(item.href!)
            ? "bg-[#0866FF] text-white font-medium"
            : "text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1C1E21]"
        )}
      >
        <span className="mr-3">{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md border border-[#DADDE1]"
      >
        {mobileOpen ? <X size={20} className="text-[#1C1E21]" /> : <Menu size={20} className="text-[#1C1E21]" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-white border-r border-[#DADDE1] z-50 transition-transform",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-5 py-4 border-b border-[#E4E6EB]">
            <img
              src="/images/logo.png"
              alt="Computer Repair Management System"
              className="w-[180px] h-auto"
            />
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-2 bg-[#F0F2F5] rounded-full text-sm text-[#65676B] hover:bg-[#E4E6EB] transition-colors"
            >
              <Search size={16} />
              <span>Search...</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
            {navItems.map(renderNavItem)}
          </nav>

          {/* User info & Logout */}
          <div className="border-t border-[#E4E6EB] p-3">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 bg-[#0866FF] rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1E21] truncate">{user?.name}</p>
                <p className="text-xs text-[#65676B] truncate capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-[#65676B] rounded-lg hover:bg-[#F0F2F5] transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
