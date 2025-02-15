"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Interfaces for our data
interface DailyStatItem {
  tanggal: string;
  total_penjualan: number;
  jumlah_transaksi: number;
  total_modal: number;
  laba: number;
}

interface RecentActivity {
  time: string;
  desc: string;
  value: string;
}

interface DashboardSummary {
  total_penjualan_30_hari: number;
  total_transaksi_30_hari: number;
  total_laba_30_hari: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState<DailyStatItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "total_penjualan" | "jumlah_transaksi" | "laba"
  >("total_penjualan");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await fetch("/api/dashboard/daily-stats");
        if (!statsResponse.ok) {
          throw new Error(`Gagal mengambil statistik: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();

        // Fetch recent activities
        const activitiesResponse = await fetch(
          "/api/dashboard/recent-activities"
        );
        if (!activitiesResponse.ok) {
          throw new Error(
            `Gagal mengambil aktivitas: ${activitiesResponse.status}`
          );
        }
        const activitiesData = await activitiesResponse.json();

        // Set state
        setDailyData(statsData.daily_data || []);
        setSummary(statsData.summary || null);
        setRecentActivities(activitiesData || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Metric selection buttons component
  const MetricSelector = () => {
    const metrics = [
      { key: "total_penjualan", label: "Penjualan" },
      { key: "jumlah_transaksi", label: "Transaksi" },
      { key: "laba", label: "Laba" },
    ];

    return (
      <div className="flex space-x-2 mb-4">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedMetric === metric.key
                ? "bg-teal-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-400 mb-4"></div>
        <p className="text-white">Memuat data dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-center">
        <div className="bg-red-800 text-white p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Prepare data with fallbacks
  const safeDailyData =
    dailyData.length > 0
      ? dailyData
      : [
          {
            tanggal: "-",
            total_penjualan: 0,
            jumlah_transaksi: 0,
            total_modal: 0,
            laba: 0,
          },
        ];

  const safeRecentActivities =
    recentActivities.length > 0
      ? recentActivities
      : [
          {
            time: "-",
            desc: "Tidak ada aktivitas",
            value: "-",
          },
        ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            Dashboard Admin
          </h1>
          <div className="text-right">
            <p className="text-xl text-gray-400">Selamat Datang,</p>
            <p className="text-2xl font-bold text-teal-400">{user?.name}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Penjualan */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-900 text-teal-400 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Total Penjualan (30 Hari)
              </span>
            </div>
            <div className="text-2xl font-bold text-teal-400">
              {summary ? formatRupiah(summary.total_penjualan_30_hari) : "-"}
            </div>
          </div>

          {/* Jumlah Transaksi */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-900 text-purple-400 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Jumlah Transaksi (30 Hari)
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {summary ? summary.total_transaksi_30_hari : "-"}
            </div>
          </div>

          {/* Total Laba */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-900 text-pink-400 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Total Laba (30 Hari)
              </span>
            </div>
            <div className="text-2xl font-bold text-pink-400">
              {summary ? formatRupiah(summary.total_laba_30_hari) : "-"}
            </div>
          </div>
        </div>

        {/* Grafik Statistik */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              Statistik Harian
            </h3>
            <MetricSelector />
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={safeDailyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fill: "white" }}
                  axisLine={{ stroke: "white" }}
                />
                <YAxis
                  tick={{ fill: "white" }}
                  axisLine={{ stroke: "white" }}
                  tickFormatter={(value) =>
                    selectedMetric === "jumlah_transaksi"
                      ? value.toLocaleString()
                      : formatRupiah(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    color: "white",
                    border: "1px solid #374151",
                  }}
                  formatter={(value, name) => [
                    selectedMetric === "jumlah_transaksi"
                      ? value.toLocaleString()
                      : formatRupiah(value as number),
                    {
                      total_penjualan: "Penjualan",
                      jumlah_transaksi: "Transaksi",
                      laba: "Laba",
                    }[name as string],
                  ]}
                />
                <Legend wrapperStyle={{ color: "white" }} />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#10B981"
                  activeDot={{ r: 8 }}
                  name={
                    {
                      total_penjualan: "Penjualan",
                      jumlah_transaksi: "Transaksi",
                      laba: "Laba",
                    }[selectedMetric]
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aktivitas Terkini */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Aktivitas Terkini
          </h3>
          <div className="space-y-4">
            {safeRecentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-b-0"
              >
                <div>
                  <p className="text-sm text-gray-300">{activity.desc}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className="text-sm text-teal-400">{activity.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
