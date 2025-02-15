"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  buyPrice: number;
  stock: number;
  totalSold?: number;
  brand: { id?: string; name: string };
  category: { id?: string; name: string };
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // State untuk modal dan pencarian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    brand: { name: "" },
    category: { name: "" },
  });

  // Fungsi fetch data produk dengan parameter pencarian
  const fetchData = useCallback(async (search: string = "") => {
    try {
      setLoading(true);
      const url = search
        ? `/api/produk?search=${encodeURIComponent(search)}`
        : "/api/produk";

      const productsResponse = await fetch(url);
      if (!productsResponse.ok) {
        throw new Error("Gagal mengambil produk");
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce untuk pencarian
  useEffect(() => {
    // Buat timer untuk menunda pencarian
    const timeoutId = setTimeout(() => {
      fetchData(searchTerm);
    }, 500); // Delay 500ms

    // Pembersihan timer jika komponen unmount atau searchTerm berubah
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchData]);

  // Inisialisasi fetch data pertama kali
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk membuka modal tambah produk
  const handleTambahProduk = () => {
    setCurrentProduct({
      brand: { name: "" },
      category: { name: "" },
    });
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit produk
  const handleEditProduk = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  // Fungsi untuk menyimpan produk
  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = currentProduct.id ? "PUT" : "POST";
      const url = currentProduct.id
        ? `/api/produk/${currentProduct.id}`
        : "/api/produk";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentProduct,
          brand:
            typeof currentProduct.brand === "object"
              ? currentProduct.brand?.id || { name: currentProduct.brand?.name }
              : { name: currentProduct.brand },
          category:
            typeof currentProduct.category === "object"
              ? currentProduct.category?.id || {
                  name: currentProduct.category?.name,
                }
              : { name: currentProduct.category },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan produk");
      }

      const savedProduct = await response.json();

      // Update state produk
      if (currentProduct.id) {
        // Update produk yang ada
        setProducts(
          products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
      } else {
        // Tambah produk baru
        setProducts([savedProduct, ...products]);
      }

      // Tutup modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Gagal menyimpan produk"
      );
    }
  };

  // Fungsi untuk menghapus produk
  const handleHapusProduk = async (productId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const response = await fetch(`/api/produk/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus produk");
      }

      // Hapus produk dari state
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error:", error);
      setError("Gagal menghapus produk");
    }
  };

  // Loading state dengan animasi modern
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-gray-700 rounded-full mb-4"></div>
        </div>
        <div className="animate-bounce text-gray-400">Memuat data...</div>
      </div>
    );
  }

  // Error state dengan tema gelap
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-center">
        <div className="bg-red-900/50 text-red-300 p-8 rounded-xl border border-red-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Daftar Produk</h1>
          <button
            onClick={handleTambahProduk}
            className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="mr-2" /> Tambah Produk
          </button>
        </div>

        {/* Pencarian */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari produk, merek, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
          />
        </div>

        {/* Tabel Produk */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="border-b border-gray-600 p-3 text-left">Nama</th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Deskripsi
                </th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Harga Jual
                </th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Harga Modal
                </th>
                <th className="border-b border-gray-600 p-3 text-left">Stok</th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Terjual
                </th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Merek
                </th>
                <th className="border-b border-gray-600 p-3 text-left">
                  Kategori
                </th>
                <th className="border-b border-gray-600 p-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="border-b border-gray-700 p-3">
                    {product.name}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {product.description || "-"}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {formatRupiah(product.buyPrice)}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {product.stock}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {product.totalSold || 0}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {product.brand.name}
                  </td>
                  <td className="border-b border-gray-700 p-3">
                    {product.category.name}
                  </td>
                  <td className="border-b border-gray-700 p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditProduk(product)}
                        className="text-yellow-500 hover:text-yellow-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleHapusProduk(product.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center p-4 text-gray-500 bg-gray-800"
                  >
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Produk */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-96 border border-gray-700 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">
                {currentProduct.id ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <form onSubmit={handleSimpanProduk}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={currentProduct.name || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Deskripsi</label>
                  <textarea
                    value={currentProduct.description || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Harga Jual</label>
                  <input
                    type="number"
                    value={currentProduct.price || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">
                    Harga Modal
                  </label>
                  <input
                    type="number"
                    value={currentProduct.buyPrice || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        buyPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Stok</label>
                  <input
                    type="number"
                    value={currentProduct.stock || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Merek</label>
                  <input
                    type="text"
                    value={
                      typeof currentProduct.brand === "object"
                        ? currentProduct.brand?.name || ""
                        : currentProduct.brand || ""
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        brand: { name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nama Merek"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Kategori</label>
                  <input
                    type="text"
                    value={
                      typeof currentProduct.category === "object"
                        ? currentProduct.category?.name || ""
                        : currentProduct.category || ""
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        category: { name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nama Kategori"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
