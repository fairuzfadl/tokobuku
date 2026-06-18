import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function AdminBooksIndex({ books, filters }) {
  const [search, setSearch] = useState(filters?.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.books.index'), { search }, { preserveState: true, replace: true });
  };

  const handleDelete = (id, title) => {
    if (confirm(`Hapus buku "${title}"?`)) {
      router.delete(route('admin.books.destroy', id));
    }
  };

  const handleToggleActive = (id) => {
    router.patch(route('admin.books.toggleActive', id), {}, { preserveScroll: true });
  };

  return (
    <AdminLayout title="Manajemen Buku">
      <div className="flex items-center justify-between mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari judul, ISBN..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
          </div>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
            Cari
          </button>
        </form>
        <Link
          href={route('admin.books.create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Tambah Buku
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Buku</th>
              <th className="text-left px-5 py-3">Kategori</th>
              <th className="text-left px-5 py-3">Harga</th>
              <th className="text-left px-5 py-3">Stok</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.data.map(book => (
              <tr key={book.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={book.cover_image} alt={book.title} className="w-10 h-14 object-cover rounded" />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{book.title}</p>
                      <p className="text-xs text-gray-400">{book.isbn || 'No ISBN'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{book.category?.name || '-'}</td>
                <td className="px-5 py-3">
                  <p className="font-medium">{formatRupiah(book.price)}</p>
                  {book.discount_percent > 0 && (
                    <p className="text-xs text-green-600">-{book.discount_percent}%</p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={"font-medium " + (book.stock <= 5 ? 'text-red-600' : 'text-gray-900')}>
                    {book.book_type === 'digital' ? '∞' : book.stock}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggleActive(book.id)} className="flex items-center gap-1.5">
                    {book.is_active ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <Eye className="h-3.5 w-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <EyeOff className="h-3.5 w-3.5" /> Nonaktif
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={route('admin.books.edit', book.id)} className="text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(book.id, book.title)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.data.length === 0 && (
          <div className="text-center py-12 text-gray-400">Tidak ada buku ditemukan</div>
        )}
      </div>

      {/* Pagination */}
      {books.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {books.links?.map((link, i) => (
            <button
              key={i}
              disabled={!link.url}
              onClick={() => link.url && router.visit(link.url, { preserveState: true })}
              className={"px-3 py-1.5 rounded-lg text-sm " + (link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40')}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
