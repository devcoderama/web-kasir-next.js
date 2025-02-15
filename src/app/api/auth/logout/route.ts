// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Anda bisa menambahkan logika logout tambahan di sini,
    // seperti membatalkan token atau mencatat aktivitas logout

    return NextResponse.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
