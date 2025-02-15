# Struktur Proyek Aplikasi Kasir

## Struktur Folder

```
kasir-app/
│
├── src/
│   ├── app/
│   │   ├── (auth)/               # Rute autentikasi
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/           # Rute dashboard
│   │   │   ├── admin/
│   │   │   │   ├── produk/page.tsx
│   │   │   │   ├── pengguna/page.tsx
│   │   │   │   └── laporan/page.tsx
│   │   │   │
│   │   │   └── kasir/
│   │   │       ├── transaksi/page.tsx
│   │   │       └── riwayat/page.tsx
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   │
│   │   │   ├── produk/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   │
│   │   │   └── transaksi/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/                # Komponen UI
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   └── forms/
│   │       ├── ProdukForm.tsx
│   │       └── TransaksiForm.tsx
│   │
│   ├── lib/                       # Utilitas dan konfigurasi
│   │   ├── auth.ts                # Logika autentikasi
│   │   ├── db.ts                  # Koneksi database
│   │   └── utils.ts               # Fungsi utilitas
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useProduk.ts
│   │
│   ├── types/                     # Definisi tipe TypeScript
│   │   ├── user.ts
│   │   ├── produk.ts
│   │   └── transaksi.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── custom.css
│
├── prisma/                        # Definisi skema database
│   └── schema.prisma
│
├── public/                        # Aset statis
│   ├── images/
│   └── icons/
│
├── .env                           # Environment variables
├── next.config.js
├── package.json
└── README.md
```

## Fitur Utama

### 1. Autentikasi

- Login
- Register
- Role-based Access Control (Admin vs Kasir)

### 2. Manajemen Produk (Admin)

- Tambah Produk
- Edit Produk
- Hapus Produk
- Manajemen Stok

### 3. Transaksi (Kasir)


- Proses Penjualan
- Riwayat Transaksi
- Cetak Struk

### 4. Laporan (Admin)

- Laporan Penjualan
- Laporan Stok
- Analitik Sederhana

## Teknologi Utama

- Next.js 13+ (App Router)
- TypeScript
- Prisma ORM
- # PostgreSQL

- Next.js 13+ (App Router)
- TypeScript
- Prisma ORM
- Mysql
- Tailwind CSS
- NextAuth.js (Autentikasi)
- Zod (Validasi)

## Alur Kerja Utama

1. Autentikasi Pengguna
2. Redirect Berdasarkan Role
3. Manajemen Produk/Transaksi
4. Laporan & Analitik

## Persyaratan Sistem

- Node.js 18+
- PostgreSQL 13+
- # Browser Modern

- Node.js 18+
- Mysql
- Browser Modern
