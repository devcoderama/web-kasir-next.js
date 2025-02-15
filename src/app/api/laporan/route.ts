// src/app/api/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Ambil parameter tanggal dari query
    const { searchParams } = new URL(req.url);

    // Parse tanggal dengan penanganan kesalahan
    const parseDate = (dateString: string | null, defaultDate: Date) => {
      if (!dateString) return defaultDate;

      const parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? defaultDate : parsedDate;
    };

    // Gunakan default ke rentang tahun saat ini jika tanggal tidak valid
    const currentYear = new Date().getFullYear();
    const startDate = parseDate(
      searchParams.get("startDate"),
      new Date(currentYear, 0, 1)
    );
    const endDate = parseDate(
      searchParams.get("endDate"),
      new Date(currentYear, 11, 31)
    );

    // Logging untuk debugging
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    // Validasi rentang tanggal
    if (startDate > endDate) {
      return NextResponse.json(
        { error: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir" },
        { status: 400 }
      );
    }

    // Ambil semua transaksi dalam rentang tanggal
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Agregasi laporan harian
    const laporanHarian = transactions.reduce((acc, transaction) => {
      // Ambil tanggal saja (tanpa waktu)
      const tanggal = new Date(transaction.createdAt)
        .toISOString()
        .split("T")[0];

      // Inisialisasi entri untuk tanggal jika belum ada
      if (!acc[tanggal]) {
        acc[tanggal] = {
          id: `laporan_${tanggal}`,
          tanggal: tanggal,
          totalPenjualan: 0,
          jumlahTransaksi: 0,
          produkTerlaris: null,
        };
      }

      // Update total penjualan dan jumlah transaksi
      acc[tanggal].totalPenjualan += Number(transaction.total);
      acc[tanggal].jumlahTransaksi++;

      // Cari produk terlaris
      transaction.items.forEach((item) => {
        const currentProduk = acc[tanggal].produkTerlaris;
        const itemQuantity = item.quantity;

        if (!currentProduk || itemQuantity > (currentProduk.jumlah || 0)) {
          acc[tanggal].produkTerlaris = {
            nama: item.product.name,
            jumlah: itemQuantity,
          };
        }
      });

      return acc;
    }, {} as Record<string, any>);

    // Konversi ke array dan urutkan
    const laporanArray = Object.values(laporanHarian).sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    return NextResponse.json(laporanArray);
  } catch (error) {
    // Log error secara mendetail
    console.error("Error generating report:", error);

    // Kembalikan pesan error yang lebih informatif
    return NextResponse.json(
      {
        error: "Gagal menghasilkan laporan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
