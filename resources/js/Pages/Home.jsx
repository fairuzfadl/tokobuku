import MainLayout from '@/Layouts/MainLayout';
import BookCard from '@/Components/Catalog/BookCard';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function Home({ banners, featured, newArrivals, categories }) {
  return (
    <MainLayout>
      {/* Hero Banner */}
      {banners?.length > 0 && (
        <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
          {banners[0].image
            ? <img src={banners[0].image} alt={banners[0].title} className="w-full object-cover" style={{ minHeight: '320px', maxHeight: '480px' }} />
            : <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800" />}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4 py-16">
            {banners[0].title && <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{banners[0].title}</h1>}
            {banners[0].subtitle && <p className="text-white/90 text-lg mb-8 drop-shadow">{banners[0].subtitle}</p>}
            <Link href={banners[0].link || route('catalog.index')} className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition shadow-lg">
              Belanja Sekarang
            </Link>
          </div>
        </div>
      )}

      {!banners?.length && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Temukan Buku Impianmu</h1>
            <p className="text-blue-100 text-lg mb-8">Ribuan judul buku dari berbagai genre tersedia</p>
            <Link href={route('catalog.index')} className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
              Lihat Katalog
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Kategori */}
        {categories?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kategori Populer</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={route('category.show', cat.slug)}
                  className="flex flex-col items-center p-3 bg-white rounded-xl hover:shadow-md transition text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-xl">📚</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700 line-clamp-2">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Buku Unggulan */}
        {featured?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Buku Unggulan</h2>
              <Link href={route('catalog.index', { urutkan: 'terlaris' })} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                Lihat semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featured.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </section>
        )}

        {/* Buku Terbaru */}
        {newArrivals?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Buku Terbaru</h2>
              <Link href={route('catalog.index')} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                Lihat semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {newArrivals.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
