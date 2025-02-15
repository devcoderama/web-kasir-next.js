import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format } from "date-fns/format";
import { subDays } from "date-fns/subDays";

export async function GET() {
  try {
    // Tentukan rentang waktu 30 hari terakhir
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Ambil data penjualan harian
    const dailySales = await prisma.transaction.groupBy({
      by: ["createdAt"],
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Ambil jumlah transaksi harian
    const dailyTransactions = await prisma.transaction.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Hitung modal (biaya produk)
    const dailyCost = await prisma.$queryRaw`
      SELECT 
        DATE(t.createdAt) as tanggal,
        SUM(ti.quantity * p.buyPrice) as total_modal
      FROM 
        Transaction t
      JOIN 
        TransactionItem ti ON t.id = ti.transactionId
      JOIN 
        Product p ON ti.productId = p.id
      WHERE 
        t.createdAt >= ${thirtyDaysAgo}
      GROUP BY 
        DATE(t.createdAt)
      ORDER BY 
        tanggal ASC
    `;

    // Gabungkan data
    const dailyData = dailySales.map((sale) => {
      const formattedDate = format(new Date(sale.createdAt), "yyyy-MM-dd");
      const transactions = dailyTransactions.find(
        (t) => format(new Date(t.createdAt), "yyyy-MM-dd") === formattedDate
      );

      // Cari total modal untuk tanggal ini
      const costData = (dailyCost as any[]).find(
        (c: any) => format(new Date(c.tanggal), "yyyy-MM-dd") === formattedDate
      );

      return {
        tanggal: formattedDate,
        total_penjualan: Number(sale._sum.total || 0),
        jumlah_transaksi: transactions ? transactions._count.id : 0,
        total_modal: costData ? Number(costData.total_modal) : 0,
        laba:
          Number(sale._sum.total || 0) -
          (costData ? Number(costData.total_modal) : 0),
      };
    });

    // Hitung ringkasan
    const summary = {
      total_penjualan_30_hari: dailyData.reduce(
        (sum, item) => sum + item.total_penjualan,
        0
      ),
      total_transaksi_30_hari: dailyData.reduce(
        (sum, item) => sum + item.jumlah_transaksi,
        0
      ),
      total_laba_30_hari: dailyData.reduce((sum, item) => sum + item.laba, 0),
    };

    return NextResponse.json({
      daily_data: dailyData,
      summary,
    });
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik harian" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
