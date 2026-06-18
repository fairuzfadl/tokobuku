import MainLayout from '@/Layouts/MainLayout';
import BookCard from '@/Components/Catalog/BookCard';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { useState } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terlaris', label: 'Terlaris' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'harga_asc', label: 'Harga Terendah' },
  { value: 'harga_desc', label: 'Harga Tertinggi' },
];

export default function CatalogIndex({ books, categories, filters, category }) {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const applyFilters = (newFilters) => {
    const merged = { ...localFilters, ...newFilters };
    setLocalFilters(merged);
    router.get(route('catalog.index'), merged, { preserveState: true, replace: true });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {category && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            {category.description && <p className="text-gray-600 mt-1">{category.description}</p>}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </h3>

              {/* Kategori */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Kategori</p>
                {categories?.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="kategori"
                      value={cat.id}
                      checked={localFilters.kategori == cat.id}
                      onChange={() => applyFilters({ kategori: cat.id })}
                      className="text-blue-600"
                    />
                    {cat.name}
                  </label>
                ))}
                {localFilters.kategori && (
                  <button onClick={() => applyFilters({ kategori: '' })} className="text-xs text-blue-600 mt-1">Reset</button>
                )}
              </div>

              {/* Rating */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Rating Minimum</p>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      checked={localFilters.rating == r}
                      onChange={() => applyFilters({ rating: r })}
                    />
                    {'⭐'.repeat(r)} ke atas
                  </label>
                ))}
              </div>

              {/* Jenis */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Jenis Buku</p>
                {['physical', 'digital'].map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="jenis"
                      value={t}
                      checked={localFilters.jenis === t}
                      onChange={() => applyFilters({ jenis: t })}
                    />
                    {t === 'physical' ? 'Buku Fisik' : 'Buku Digital'}
                  </label>
                ))}
              </div>

              <button
                onClick={() => { setLocalFilters({}); router.get(route('catalog.index')); }}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset Semua Filter
              </button>
            </div>
          </aside>

          {/* Grid Buku */}
          <div className="flex-1">
            {/* Sort & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-gray-600 text-sm">
                Menampilkan <strong>{books.total}</strong> buku
                {filters?.q && <span> untuk "<em>{filters.q}</em>"</span>}
              </p>
              <select
                value={localFilters.urutkan || 'terbaru'}
                onChange={e => applyFilters({ urutkan: e.target.value })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {books.data.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Tidak ada buku ditemukan</p>
                <Link href={route('catalog.index')} className="text-blue-600 text-sm mt-2 inline-block">Lihat semua buku</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.data.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            )}

            {/* Pagination */}
            {books.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {books.links.map((link, i) => (
                  link.url ? (
                    <Link
                      key={i}
                      href={link.url}
                      className={`px-3 py-2 rounded-lg text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ) : (
                    <span key={i} className="px-3 py-2 text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
