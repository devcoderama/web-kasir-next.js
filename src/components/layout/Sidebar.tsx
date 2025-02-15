"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ShoppingCart,
  ClipboardList,
  LogIn,
  UserPlus,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // Jika loading, tampilkan loading
  if (loading) {
    return (
      <div className="w-64 bg-gray-900 text-white h-full fixed flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Jika tidak login, tampilkan tombol login dan register
  if (!user) {
    return (
      <div className="w-64 bg-gray-900 text-white h-full fixed shadow-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-blue-400">Kasir App</h2>
        </div>
        <nav className="mt-8 px-4 space-y-4">
          <Link
            href="/login"
            className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors group"
          >
            <LogIn className="mr-2 group-hover:animate-pulse" />
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors group"
          >
            <UserPlus className="mr-2 group-hover:animate-pulse" />
            Register
          </Link>
        </nav>
      </div>
    );
  }

  const adminMenus = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Produk",
      href: "/admin/produk",
      icon: Package,
    },
    {
      label: "Pengguna",
      href: "/admin/pengguna",
      icon: Users,
    },
    {
      label: "Laporan",
      href: "/admin/laporan",
      icon: FileText,
    },
  ];

  const kasirMenus = [
    {
      label: "Transaksi",
      href: "/kasir/transaksi",
      icon: ShoppingCart,
    },
    {
      label: "Riwayat",
      href: "/kasir/riwayat",
      icon: ClipboardList,
    },
  ];

  const menus = user.role === "ADMIN" ? adminMenus : kasirMenus;

  return (
    <div className="w-64 bg-gray-900 text-white h-full fixed shadow-lg">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">Kasir App</h2>
          <p className="text-sm text-gray-400 mt-1">{user.name}</p>
        </div>
        <Menu className="text-gray-400 cursor-pointer hover:text-white" />
      </div>
      <nav className="mt-4">
        {menus.map((menu) => {
          const IconComponent = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex items-center px-6 py-3 hover:bg-gray-800 transition-colors
                ${
                  pathname === menu.href
                    ? "bg-gray-800 text-blue-400 border-r-4 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <IconComponent className="mr-4" size={20} />
              {menu.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="w-full flex items-center px-6 py-3 text-left text-red-400 hover:bg-gray-800 hover:text-red-500 transition-colors"
        >
          <LogIn className="mr-4" size={20} />
          Logout
        </button>
      </nav>
    </div>
  );
}
