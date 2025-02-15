"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  FireIcon,
} from "@heroicons/react/24/solid";

// Definisi tipe untuk laporan
interface LaporanTransaksi {
  id: string;
  tanggal: string;
  totalPenjualan: number;
  jumlahTransaksi: number;
  produkTerlaris: {
    nama: string;
    jumlah: number;
  };
}

interface FilterLaporan {
  startDate: string;
  endDate: string;
}

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<LaporanTransaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterLaporan>({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Ambil laporan
  useEffect(() => {
    async function fetchLaporan() {
      try {
        const queryParams = new URLSearchParams({
          startDate: filter.startDate,
          endDate: filter.endDate,
        });

        const response = await fetch(`/api/laporan?${queryParams}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil laporan");
        }

        const data = await response.json();
        setLaporan(data);
        setLoading(false);
      } catch (err) {
        setError("Tidak dapat memuat laporan");
        setLoading(false);
      }
    }

    fetchLaporan();
  }, [filter]);

  // Hitung total penjualan
  const totalPenjualan = laporan.reduce(
    (sum, item) => sum + item.totalPenjualan,
    0
  );

  // Export laporan ke CSV
  const exportToCSV = () => {
    // Buat header CSV
    const headers = [
      "Tanggal",
      "Total Penjualan",
      "Jumlah Transaksi",
      "Produk Terlaris",
      "Jumlah Produk Terlaris",
    ];

    // Buat baris data
    const csvData = laporan.map((item) => [
      item.tanggal,
      item.totalPenjualan,
      item.jumlahTransaksi,
      item.produkTerlaris?.nama || "-",
      item.produkTerlaris?.jumlah || 0,
    ]);

    // Gabungkan header dan data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Buat file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_penjualan_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error
  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative animate-shake">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400 animate-fade-in">
          Laporan Penjualan
        </h1>

        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white 
              focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white 
              focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded 
            hover:bg-green-700 transition-colors duration-300 
            flex items-center space-x-2 group"
          >
            <DocumentArrowDownIcon className="h-5 w-5 group-hover:animate-bounce" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 
        hover:bg-gray-700 transition-colors duration-300 
        flex items-center space-x-4"
        >
          <ChartBarIcon className="h-10 w-10 text-blue-500" />
          <div>
            <h3 className="text-gray-400">Total Penjualan</h3>
            <p className="text-2xl font-bold text-blue-400">
              {formatRupiah(totalPenjualan)}
            </p>
          </div>
        </div>
        <div
          className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 
        hover:bg-gray-700 transition-colors duration-300 
        flex items-center space-x-4"
        >
          <ShoppingCartIcon className="h-10 w-10 text-green-500" />
          <div>
            <h3 className="text-gray-400">Jumlah Transaksi</h3>
            <p className="text-2xl font-bold text-green-400">
              {laporan.reduce((sum, item) => sum + item.jumlahTransaksi, 0)}
            </p>
          </div>
        </div>
        <div
          className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 
        hover:bg-gray-700 transition-colors duration-300 
        flex items-center space-x-4"
        >
          <FireIcon className="h-10 w-10 text-purple-500" />
          <div>
            <h3 className="text-gray-400">Produk Terlaris</h3>
            <p className="text-xl font-bold text-purple-400">
              {laporan[0]?.produkTerlaris?.nama || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Laporan */}
      <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              {[
                "Tanggal",
                "Total Penjualan",
                "Jumlah Transaksi",
                "Produk Terlaris",
              ].map((header) => (
                <th key={header} className="p-3 text-left text-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {laporan.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-700 hover:bg-gray-700 
                transition-colors duration-200"
              >
                <td className="p-3">
                  {new Date(item.tanggal).toLocaleDateString()}
                </td>
                <td className="p-3 text-blue-300">
                  {formatRupiah(item.totalPenjualan)}
                </td>
                <td className="p-3 text-green-300">{item.jumlahTransaksi}</td>
                <td className="p-3 text-purple-300">
                  {item.produkTerlaris
                    ? `${item.produkTerlaris.nama} (${item.produkTerlaris.jumlah})`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {laporan.length === 0 && (
          <div className="text-center p-4 text-gray-500 animate-pulse">
            Tidak ada data laporan untuk periode ini
          </div>
        )}
      </div>
    </div>
  );
}
