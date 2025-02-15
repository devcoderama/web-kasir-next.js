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

# <<<<<<< HEAD

> > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)

- Login
- Register
- Role-based Access Control (Admin vs Kasir)

### 2. Manajemen Produk (Admin)

# <<<<<<< HEAD

> > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)

- Tambah Produk
- Edit Produk
- Hapus Produk
- Manajemen Stok

### 3. Transaksi (Kasir)

# <<<<<<< HEAD

> > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)

- Proses Penjualan
- Riwayat Transaksi
- Cetak Struk

### 4. Laporan (Admin)

# <<<<<<< HEAD

> > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)

- Laporan Penjualan
- Laporan Stok
- Analitik Sederhana

## Teknologi Utama

<<<<<<< HEAD

- Next.js 13+ (App Router)
- TypeScript
- Prisma ORM
- # PostgreSQL

- Next.js 13+ (App Router)
- TypeScript
- Prisma ORM
- Mysql
  > > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)
- Tailwind CSS
- NextAuth.js (Autentikasi)
- Zod (Validasi)

## Alur Kerja Utama

# <<<<<<< HEAD

> > > > > > > 5604f9f (Initial commit: Web Kasir Next.js project)

1. Autentikasi Pengguna
2. Redirect Berdasarkan Role
3. Manajemen Produk/Transaksi
4. Laporan & Analitik

## Persyaratan Sistem

<<<<<<< HEAD

- Node.js 18+
- PostgreSQL 13+
- # Browser Modern

- Node.js 18+
- Mysql
- Browser Modern

```

>>>>>>> 5604f9f (Initial commit: Web Kasir Next.js project)
```
