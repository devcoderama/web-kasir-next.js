"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect berdasarkan role
        if (user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/kasir/transaksi");
        }
      } else {
        // Jika tidak login, arahkan ke login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Aplikasi Kasir</h1>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}
