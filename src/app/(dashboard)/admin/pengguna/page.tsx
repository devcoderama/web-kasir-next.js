"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  TrashIcon,
  PlusIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// Definisi tipe untuk pengguna
interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "KASIR";
  createdAt: string;
}

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "KASIR",
  });

  const { user: currentUser } = useAuth();

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Gagal mengambil daftar pengguna");
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError("Tidak dapat memuat daftar pengguna");
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Tambah pengguna baru
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        // Tambahkan pengguna baru ke daftar
        setUsers([...users, data]);
        // Reset form
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "KASIR",
        });
        setShowModal(false);
      } else {
        setError(data.error || "Gagal menambahkan pengguna");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menambahkan pengguna");
    }
  };

  // Hapus pengguna
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Hapus pengguna dari daftar
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await response.json();
        setError(data.error || "Gagal menghapus pengguna");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus pengguna");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400 animate-fade-in">
          Manajemen Pengguna
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded 
          hover:bg-blue-700 transition-colors duration-300 
          flex items-center space-x-2 group"
        >
          <UserPlusIcon className="h-5 w-5 group-hover:animate-bounce" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {error && (
        <div
          className="bg-red-800 text-red-200 px-4 py-3 rounded mb-4 
        animate-shake"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-800 shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              {["Nama", "Email", "Role", "Tanggal Dibuat", "Aksi"].map(
                (header) => (
                  <th
                    key={header}
                    className="border border-gray-600 p-2 text-left"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="border border-gray-600 p-2">{u.name}</td>
                <td className="border border-gray-600 p-2">{u.email}</td>
                <td className="border border-gray-600 p-2">
                  <span
                    className={`
                    px-2 py-1 rounded text-sm
                    ${
                      u.role === "ADMIN"
                        ? "bg-red-700 text-red-100"
                        : "bg-blue-700 text-blue-100"
                    }
                  `}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="border border-gray-600 p-2">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-600 p-2">
                  {currentUser?.id !== u.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="bg-red-600 text-white px-2 py-1 
                      rounded flex items-center space-x-1 
                      hover:bg-red-700 transition-colors 
                      group"
                    >
                      <TrashIcon className="h-4 w-4 group-hover:animate-wiggle" />
                      <span>Hapus</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Pengguna */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 
          flex items-center justify-center 
          animate-fade-in"
        >
          <div
            className="bg-gray-800 p-6 rounded-lg w-96 
            border border-gray-700 shadow-2xl 
            animate-slide-up"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                Tambah Pengguna Baru
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              {/* Input fields dengan desain dark mode */}
              {[
                {
                  label: "Nama",
                  type: "text",
                  value: newUser.name,
                  onChange: (e) =>
                    setNewUser({ ...newUser, name: e.target.value }),
                },
                {
                  label: "Email",
                  type: "email",
                  value: newUser.email,
                  onChange: (e) =>
                    setNewUser({ ...newUser, email: e.target.value }),
                },
                {
                  label: "Password",
                  type: "password",
                  value: newUser.password,
                  onChange: (e) =>
                    setNewUser({ ...newUser, password: e.target.value }),
                },
              ].map(({ label, type, value, onChange }) => (
                <div key={label} className="mb-4">
                  <label className="block mb-2 text-gray-300">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2 
                    bg-gray-700 border border-gray-600 
                    rounded text-white 
                    focus:outline-none focus:ring-2 
                    focus:ring-blue-500"
                    required
                    minLength={type === "password" ? 6 : undefined}
                  />
                </div>
              ))}

              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as "ADMIN" | "KASIR",
                    })
                  }
                  className="w-full px-3 py-2 
                  bg-gray-700 border border-gray-600 
                  rounded text-white 
                  focus:outline-none focus:ring-2 
                  focus:ring-blue-500"
                >
                  <option value="KASIR">Kasir</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 
                  text-gray-300 rounded 
                  hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 
                  text-white rounded 
                  hover:bg-blue-700 transition-colors 
                  flex items-center space-x-2 group"
                >
                  <PlusIcon className="h-5 w-5 group-hover:animate-bounce" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
