"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  FileTextIcon,
  SearchIcon,
  DownloadIcon,
  CalendarIcon,
  PackageIcon,
  CreditCardIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Transaksi {
  id: string;
  total: number;
  createdAt: string;
  kasirName: string;
  items: {
    product: {
      name: string;
      brand: string;
      category: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  buyerName?: string;
}

export default function RiwayatTransaksiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Ambil riwayat transaksi
  useEffect(() => {
    async function fetchRiwayatTransaksi() {
      // Pastikan user sudah terautentikasi
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const queryParams = new URLSearchParams({
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          search: searchTerm,
        });

        const response = await fetch(`/api/transaksi/riwayat?${queryParams}`, {
          headers: {
            "x-user-id": user.id, // Kirim user ID melalui header
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Gagal mengambil riwayat transaksi"
          );
        }

        const data = await response.json();
        setTransaksi(data);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Tidak dapat memuat riwayat transaksi");
        setLoading(false);
      }
    }

    fetchRiwayatTransaksi();
  }, [searchTerm, dateFilter, user, router]);

  // Export transaksi ke CSV
  const exportToCSV = () => {
    const headers = [
      "ID Transaksi",
      "Tanggal",
      "Nama Pembeli",
      "Total",
      "Nama Kasir",
      "Detail Produk",
    ];

    const csvData = transaksi.map((item) => [
      item.id,
      new Date(item.createdAt).toLocaleDateString(),
      item.buyerName || "-",
      item.total,
      item.kasirName,
      item.items
        .map(
          (detail) =>
            `${detail.product.name} (${detail.product.brand} - ${
              detail.product.category
            }) x${detail.quantity} @ ${formatRupiah(detail.price)}`
        )
        .join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `riwayat_transaksi_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Memuat Riwayat Transaksi...</p>
        </div>
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg shadow-xl flex items-center">
          <AlertTriangleIcon className="mr-4 text-red-500 h-12 w-12" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Kesalahan</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center text-blue-400">
          <FileTextIcon className="mr-4 h-10 w-10" />
          Riwayat Transaksi
        </h1>

        <div className="flex items-center space-x-4">
          {/* Filter Tanggal */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
            <CalendarIcon className="text-gray-500 h-5 w-5" />
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="bg-transparent text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="bg-transparent text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pencarian */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari transaksi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Tombol Export */}
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors group"
          >
            <DownloadIcon className="mr-2 group-hover:animate-bounce" />
            Export
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-4">
          <CreditCardIcon className="h-10 w-10 text-blue-500" />
          <div>
            <p className="text-gray-400">Total Transaksi</p>
            <p className="text-2xl font-bold text-blue-400">
              {transaksi.length}
            </p>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-4">
          <PackageIcon className="h-10 w-10 text-green-500" />
          <div>
            <p className="text-gray-400">Total Penjualan</p>
            <p className="text-2xl font-bold text-green-400">
              {formatRupiah(
                transaksi.reduce((sum, item) => sum + item.total, 0)
              )}
            </p>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-4">
          <FileTextIcon className="h-10 w-10 text-purple-500" />
          <div>
            <p className="text-gray-400">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-purple-400">
              {transaksi.length > 0
                ? formatRupiah(
                    transaksi.reduce((sum, item) => sum + item.total, 0) /
                      transaksi.length
                  )
                : formatRupiah(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
        {transaksi.length === 0 ? (
          <div className="text-center p-8 text-gray-500 flex flex-col items-center">
            <PackageIcon className="h-16 w-16 mb-4 text-gray-600" />
            <p className="text-xl">Tidak ada riwayat transaksi</p>
            <p className="text-sm text-gray-400 mt-2">
              Cobalah sesuaikan filter atau periode tanggal
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">ID Transaksi</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="p-3 text-left">Nama Pembeli</th>
                <th className="p-3 text-left">Kasir</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Produk</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="p-3 text-blue-300">{item.id}</td>
                  <td className="p-3">{formatDate(item.createdAt)}</td>
                  <td className="p-3 text-purple-300">
                    {item.buyerName || "-"}
                  </td>
                  <td className="p-3 text-green-300">{item.kasirName}</td>
                  <td className="p-3 text-green-400">
                    {formatRupiah(item.total)}
                  </td>
                  <td className="p-3">
                    {item.items.map((detail) => (
                      <div
                        key={detail.product.name}
                        className="text-blue-200 mb-1"
                      >
                        {detail.product.name}
                        <span className="text-xs text-gray-400 ml-2">
                          ({detail.product.brand} - {detail.product.category})
                        </span>
                        <span className="text-sm text-gray-300 ml-2">
                          x{detail.quantity} @ {formatRupiah(detail.price)}
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
