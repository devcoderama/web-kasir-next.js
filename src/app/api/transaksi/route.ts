import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Skema validasi item transaksi
const TransactionItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  price: z.number().positive("Harga harus positif"),
  subtotal: z.number().optional(),
  notes: z.string().optional(),
});

// Skema validasi transaksi
const TransactionSchema = z.object({
  buyerName: z.string().optional(),
  kasirId: z.string(),
  items: z
    .array(TransactionItemSchema)
    .min(1, "Transaksi harus memiliki minimal 1 item"),
  total: z.number().positive("Total harus positif"),
  discount: z.number().optional(),
  paymentMethod: z.string().optional().default("Cash"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse dan validasi body request
    const body = await req.json();
    const { buyerName, kasirId, items, total, discount, paymentMethod, notes } =
      TransactionSchema.parse(body);

    // Validasi stok dan harga sebelum transaksi
    const stokValidation = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok produk ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}`
          );
        }

        // Validasi harga sesuai produk
        if (Math.abs(product.price - item.price) > 0.01) {
          throw new Error(`Harga produk ${product.name} tidak sesuai`);
        }

        return product;
      })
    );

    // Hitung ulang total untuk validasi tambahan
    const hitungTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (Math.abs(hitungTotal - total) > 0.01) {
      throw new Error("Total transaksi tidak sesuai");
    }

    // Mulai transaksi database
    const transaction = await prisma.$transaction(async (prisma) => {
      // Buat transaksi
      const newTransaction = await prisma.transaction.create({
        data: {
          buyerName,
          kasirId,
          total,
          discount,
          paymentMethod,
          notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      });

      // Update stok produk
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newTransaction;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaksi error:", error);

    // Tangani error Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validasi data gagal",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Tangani error kustom
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Error umum
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat transaksi" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const transactions = await prisma.transaction.findMany({
      include: {
        kasir: {
          select: { name: true },
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.transaction.count();

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Transaksi error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil transaksi" },
      { status: 500 }
    );
  }
}
