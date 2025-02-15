"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CreditCardIcon,
} from "@heroicons/react/24/solid";

interface Produk {
  id: string;
  name: string;
  price: number;
  stock: number;
  brand: { name: string };
  category: { name: string };
}

interface KeranjangItem {
  productId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export default function TransaksiPage() {
  const { user } = useAuth();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [keranjang, setKeranjang] = useState<{ [key: string]: number }>({});
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProduk, setFilteredProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduk() {
      try {
        const response = await fetch("/api/produk");
        const data = await response.json();

        // Konversi data produk pastikan price adalah number
        const convertedData = data.map((item: any) => ({
          ...item,
          price: Number(item.price),
        }));

        setProduk(convertedData);
        setFilteredProduk(convertedData);
      } catch (error) {
        console.error("Gagal memuat produk:", error);
        setError("Tidak dapat memuat produk");
      }
    }

    fetchProduk();
  }, []);

  // Pencarian produk
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProduk(produk);
      return;
    }

    const filtered = produk.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProduk(filtered);
  }, [searchTerm, produk]);

  const tambahKeKeranjang = (produk: Produk) => {
    const currentQty = keranjang[produk.id] || 0;
    if (currentQty < produk.stock) {
      const newKeranjang = {
        ...keranjang,
        [produk.id]: currentQty + 1,
      };
      setKeranjang(newKeranjang);
      hitungTotal(newKeranjang);
    }
  };

  const hapusDariKeranjang = (produkId: string) => {
    const newKeranjang = { ...keranjang };
    if (newKeranjang[produkId] > 1) {
      newKeranjang[produkId] -= 1;
    } else {
      delete newKeranjang[produkId];
    }
    setKeranjang(newKeranjang);
    hitungTotal(newKeranjang);
  };

  const hitungTotal = (keranjangItems: { [key: string]: number }) => {
    const totalBaru = produk.reduce((sum, p) => {
      return sum + p.price * (keranjangItems[p.id] || 0);
    }, 0);
    setTotal(totalBaru);
  };

  const prosesPembayaran = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buat item transaksi
      const itemTransaksi: KeranjangItem[] = produk
        .filter((p) => keranjang[p.id] > 0)
        .map((p) => ({
          productId: p.id,
          quantity: keranjang[p.id],
          price: p.price,
          notes: "", // Tambahkan catatan opsional jika diperlukan
        }));

      // Validasi sebelum transaksi
      if (itemTransaksi.length === 0) {
        throw new Error("Keranjang kosong");
      }

      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kasirId: user?.id,
          items: itemTransaksi,
          total: total,
          paymentMethod: "Cash",
          // Opsional: tambahkan buyerName atau notes jika diperlukan
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset keranjang dan total
        setKeranjang({});
        setTotal(0);

        // Tampilkan konfirmasi
        alert("Transaksi berhasil!");
      } else {
        // Tangani error dari server
        setError(data.error || "Transaksi gagal");
      }
    } catch (error: any) {
      console.error("Gagal memproses transaksi:", error);
      setError(error.message || "Terjadi kesalahan saat memproses transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">
          Transaksi - {user?.name}
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            pl-10 w-64"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <XMarkIcon
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 h-5 w-5 
              text-gray-400 cursor-pointer hover:text-white 
              transition-colors"
            />
          )}
        </div>
      </div>

      {/* Tampilkan pesan error jika ada */}
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daftar Produk */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <ShoppingCartIcon className="h-6 w-6 text-blue-500" />
            <span>Daftar Produk</span>
          </h2>

          {filteredProduk.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              Tidak ada produk ditemukan
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProduk.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-800 p-4 rounded-lg shadow-lg 
                  cursor-pointer hover:bg-gray-700 
                  transition-colors duration-300 
                  transform hover:scale-105"
                  onClick={() => tambahKeKeranjang(p)}
                >
                  <h3 className="font-bold text-blue-400">{p.name}</h3>
                  <p className="text-green-400">{formatRupiah(p.price)}</p>
                  <p className="text-gray-400">Stok: {p.stock}</p>
                  <p className="text-sm text-purple-400">
                    {p.brand.name} - {p.category.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keranjang */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <CreditCardIcon className="h-6 w-6 text-green-500" />
            <span>Keranjang</span>
          </h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            {produk
              .filter((p) => keranjang[p.id] > 0)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center mb-2 
                  bg-gray-700 p-2 rounded"
                >
                  <span>{p.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => hapusDariKeranjang(p.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span>
                      {keranjang[p.id]} x {formatRupiah(p.price)}
                    </span>
                    <button
                      onClick={() => tambahKeKeranjang(p)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      disabled={p.stock <= keranjang[p.id]}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            <hr className="my-2 border-gray-600" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-green-400">{formatRupiah(total)}</span>
            </div>
            <button
              onClick={prosesPembayaran}
              disabled={total === 0 || loading}
              className="w-full bg-blue-600 text-white py-2 
              rounded mt-4 hover:bg-blue-700 
              transition-colors duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
              ) : (
                <CreditCardIcon className="h-5 w-5 group-hover:animate-bounce" />
              )}
              <span>{loading ? "Memproses..." : "Proses Pembayaran"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
