"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, AlertTriangle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validasi
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      setIsLoading(false);

      if (response.ok) {
        // Redirect ke halaman login dengan pesan sukses
        router.push("/login");
      } else {
        setError(data.error || "Registrasi gagal");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Terjadi kesalahan saat registrasi");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">
              Buat Akun Kasir
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertTriangle className="mr-3 text-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-500 transition-all duration-300 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-all duration-300 
                    placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-500 transition-all duration-300 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-all duration-300 
                    placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-500 transition-all duration-300 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-all duration-300 
                    placeholder-gray-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-500 transition-all duration-300 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Konfirmasi Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-all duration-300 
                    placeholder-gray-500"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg 
                  hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
                  transition-all duration-300 flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
                ) : (
                  <>
                    <UserPlus className="mr-2 group-hover:animate-pulse" />
                    Daftar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Sudah punya akun?{" "}
                <a
                  href="/login"
                  className="text-green-500 hover:underline transition-colors"
                >
                  Masuk
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
