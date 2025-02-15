import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";

// Gunakan fungsi formatDistance dari date-fns secara langsung
import { formatDistance } from "date-fns/formatDistance";
import { id } from "date-fns/locale";

export async function GET() {
  try {
    // Ambil 10 transaksi terbaru dengan detail
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        kasir: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Format aktivitas
    const activities = recentTransactions.map((transaction) => {
      // Ambil nama produk dari item transaksi
      const productNames = transaction.items
        .map((item) => item.product.name)
        .join(", ");

      // Hitung waktu relatif
      const timeAgo = formatDistance(transaction.createdAt, new Date(), {
        addSuffix: true,
        locale: id,
      });

      return {
        time: timeAgo,
        desc: `Penjualan ${transaction.items.length} produk: ${productNames}`,
        value: formatRupiah(transaction.total),
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return NextResponse.json(
      { error: "Gagal mengambil aktivitas terkini" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
