import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "KASIR";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fungsi untuk validasi token
    async function validateToken() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // Tambahkan pengecekan tambahan
      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Validasi token ke backend
        const response = await fetch("/api/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Pastikan data dari server cocok dengan data lokal
          const parsedStoredUser = JSON.parse(storedUser);
          if (data.id === parsedStoredUser.id) {
            setUser(parsedStoredUser);
          } else {
            throw new Error("Data pengguna tidak valid");
          }
        } else {
          // Token tidak valid, logout
          throw new Error(data.error || "Token tidak valid");
        }
      } catch (error) {
        console.error("Validation error:", error);
        // Hapus data yang rusak
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setError(
          error instanceof Error
            ? error.message
            : "Sesi Anda telah berakhir. Silakan login kembali."
        );
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [router]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token dan user dengan aman
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setError(null);

        // Redirect berdasarkan role
        router.push(
          data.user.role === "ADMIN" ? "/admin/dashboard" : "/kasir/transaksi"
        );

        return true;
      } else {
        setError(data.error || "Login gagal");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Kirim request logout ke backend (opsional)
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).catch(console.error);

    // Hapus data lokal
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset state
    setUser(null);
    setError(null);

    // Redirect ke halaman login
    router.push("/login");
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "KASIR";
  }) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Tampilkan pesan sukses sebelum redirect
        alert("Registrasi berhasil. Silakan login.");

        // Redirect ke login
        router.push("/login");
        return true;
      } else {
        setError(data.error || "Registrasi gagal");
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAdmin: user?.role === "ADMIN",
    isKasir: user?.role === "KASIR",
  };
}
