// src/app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateToken, getUserFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1]; // Bearer token

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    // Validasi token
    const decoded = await validateToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    // Dapatkan user dari token
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat validasi" },
      { status: 500 }
    );
  }
}
