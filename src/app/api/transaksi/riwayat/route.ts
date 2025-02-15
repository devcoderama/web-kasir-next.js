// src/app/api/transaksi/riwayat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Skema validasi input
const QueryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Ambil user ID dari parameter query atau header
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Ambil parameter dari query
    const { searchParams } = new URL(req.url);
    const params = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Validasi parameter
    const validatedParams = QueryParamsSchema.parse(params);

    // Tentukan rentang tanggal
    const startDate = validatedParams.startDate
      ? new Date(validatedParams.startDate)
      : new Date(new Date().getFullYear(), 0, 1);

    const endDate = validatedParams.endDate
      ? new Date(validatedParams.endDate)
      : new Date();

    // Kondisi pencarian
    const searchConditions = validatedParams.search
      ? {
          OR: [
            {
              buyerName: {
                contains: validatedParams.search,
                mode: "insensitive",
              },
            },
            {
              items: {
                some: {
                  product: {
                    name: {
                      contains: validatedParams.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        }
      : {};

    // Ambil riwayat transaksi untuk kasir yang sedang login
    const transaksi = await prisma.transaction.findMany({
      where: {
        kasirId: userId, // Filter berdasarkan ID kasir
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...searchConditions,
      },
      include: {
        kasir: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                brand: {
                  select: {
                    name: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      // Batasi jumlah transaksi
      take: 100,
    });

    // Transform data untuk menghasilkan struktur yang diinginkan
    const transformedTransaksi = transaksi.map((transaction) => ({
      id: transaction.id,
      total: Number(transaction.total),
      createdAt: transaction.createdAt,
      buyerName: transaction.buyerName || "-",
      kasirName: transaction.kasir.name,
      items: transaction.items.map((item) => ({
        product: {
          name: item.product.name,
          brand: item.product.brand.name,
          category: item.product.category.name,
        },
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
    }));

    // Jika tidak ada transaksi, kembalikan array kosong
    return NextResponse.json(transformedTransaksi);
  } catch (error) {
    console.error("Error mengambil riwayat transaksi:", error);

    // Tangani error Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validasi parameter gagal",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Tangani error parsing tanggal
    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    // Error umum
    return NextResponse.json(
      { error: "Gagal mengambil riwayat transaksi" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
