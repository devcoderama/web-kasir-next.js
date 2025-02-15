import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Endpoint GET untuk mengambil semua brand
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar merek" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
