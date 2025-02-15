import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint GET untuk mengambil semua kategori
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar kategori" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
