import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Ambil parameter pencarian dari query string
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search")?.trim().toLowerCase() || "";

    // Kondisi pencarian dinamis
    const searchConditions: Prisma.ProductWhereInput = searchTerm
      ? {
          OR: [
            {
              name: {
                contains: searchTerm,
              },
            },
            {
              brand: {
                name: {
                  contains: searchTerm,
                },
              },
            },
            {
              category: {
                name: {
                  contains: searchTerm,
                },
              },
            },
          ],
        }
      : {};

    // Ambil produk dengan pencarian dan relasi
    const products = await prisma.product.findMany({
      where: searchConditions,
      include: {
        brand: true,
        category: true,
        transactionItems: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      // Tambahkan batasan untuk menghindari error dengan input sangat pendek
      take: searchTerm && searchTerm.length > 1 ? undefined : 10,
    });

    // Hitung total transaksi untuk setiap produk
    const productsWithSalesCount = products.map((product) => ({
      ...product,
      totalSold: product.transactionItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    }));

    return NextResponse.json(productsWithSalesCount);
  } catch (error) {
    console.error("Error fetching products:", error);

    // Log detail error untuk debugging
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    return NextResponse.json(
      {
        error: "Gagal mengambil daftar produk",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validasi data
    const { name, description, brand, category, price, buyPrice, stock } = data;

    // Validasi input wajib
    if (!name || !brand || !category || !price || !buyPrice) {
      return NextResponse.json(
        {
          error:
            "Nama, merek, kategori, harga jual, dan harga modal wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi harga
    if (price <= 0 || buyPrice <= 0) {
      return NextResponse.json(
        { error: "Harga harus lebih besar dari 0" },
        { status: 400 }
      );
    }

    // Transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (prisma) => {
      // Cari atau buat brand
      let brandRecord = await prisma.brand.findFirst({
        where: { name: brand.name },
      });

      if (!brandRecord) {
        brandRecord = await prisma.brand.create({
          data: {
            name: brand.name,
            isActive: true,
          },
        });
      }

      // Cari atau buat category
      let categoryRecord = await prisma.category.findFirst({
        where: { name: category.name },
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: category.name,
            isActive: true,
          },
        });
      }

      // Tambah produk baru
      const newProduct = await prisma.product.create({
        data: {
          name,
          description: description || undefined,
          brandId: brandRecord.id,
          categoryId: categoryRecord.id,
          price: new Prisma.Decimal(price),
          buyPrice: new Prisma.Decimal(buyPrice),
          stock: stock || 0,
        },
        include: {
          brand: true,
          category: true,
        },
      });

      return newProduct;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    // Tangani error unik dari Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error constraint unik
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Produk dengan nama ini sudah ada" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Gagal membuat produk" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: "ID produk diperlukan" },
        { status: 400 }
      );
    }

    // Validasi data
    const { name, description, brand, category, price, buyPrice, stock } = data;

    // Validasi input wajib
    if (!name || !brand || !category || !price || !buyPrice) {
      return NextResponse.json(
        {
          error:
            "Nama, merek, kategori, harga jual, dan harga modal wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi harga
    if (price <= 0 || buyPrice <= 0) {
      return NextResponse.json(
        { error: "Harga harus lebih besar dari 0" },
        { status: 400 }
      );
    }

    // Transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (prisma) => {
      // Cari atau buat brand
      let brandRecord = await prisma.brand.findFirst({
        where: { name: brand.name },
      });

      if (!brandRecord) {
        brandRecord = await prisma.brand.create({
          data: {
            name: brand.name,
            isActive: true,
          },
        });
      }

      // Cari atau buat category
      let categoryRecord = await prisma.category.findFirst({
        where: { name: category.name },
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: category.name,
            isActive: true,
          },
        });
      }

      // Update produk
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          description: description || undefined,
          brandId: brandRecord.id,
          categoryId: categoryRecord.id,
          price: new Prisma.Decimal(price),
          buyPrice: new Prisma.Decimal(buyPrice),
          stock: stock || 0,
        },
        include: {
          brand: true,
          category: true,
        },
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating product:", error);

    // Tangani error unik dari Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error constraint unik
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Produk dengan nama ini sudah ada" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "ID produk diperlukan" },
        { status: 400 }
      );
    }

    // Transaksi untuk memastikan konsistensi data
    await prisma.$transaction(async (prisma) => {
      // Cek apakah produk sudah pernah digunakan dalam transaksi
      const existingTransaction = await prisma.transactionItem.findFirst({
        where: { productId },
      });

      if (existingTransaction) {
        throw new Error(
          "Produk tidak dapat dihapus karena sudah terdapat dalam transaksi"
        );
      }

      // Hapus produk
      await prisma.product.delete({
        where: { id: productId },
      });
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (
      error instanceof Error &&
      error.message.includes("tidak dapat dihapus")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
