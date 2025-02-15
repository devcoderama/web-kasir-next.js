"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, LogIn, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validasi sederhana
    if (!email || !password) {
      setError("Email dan password harus diisi");
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    setIsLoading(false);
    if (!success) {
      setError("Login gagal. Periksa email dan password Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">
              Masuk Kasir
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
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg 
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  transition-all duration-300 flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
                ) : (
                  <>
                    <LogIn className="mr-2 group-hover:animate-pulse" />
                    Masuk
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Belum punya akun?{" "}
                <a
                  href="/register"
                  className="text-blue-500 hover:underline transition-colors"
                >
                  Daftar
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
