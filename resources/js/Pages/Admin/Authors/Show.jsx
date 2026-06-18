import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Globe, User } from 'lucide-react';
import { formatRupiah } from '@/utils/currency';

export default function AdminAuthorShow({ author }) {
  return (
    <AdminLayout title={`Penulis: ${author.name}`}>
      <div className="mb-5">
        <Link href={route('admin.authors.index')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Penulis
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{author.name}</h2>
                <p className="text-xs text-gray-400 font-mono">{author.slug}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Kewarganegaraan</span>
                <span className="font-medium text-gray-800">{author.nationality || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Jumlah Buku</span>
                <span className="font-bold text-blue-600">{author.books?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Ditambahkan</span>
                <span className="text-gray-700 text-xs">{new Date(author.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          {author.bio && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Biografi</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{author.bio}</p>
            </div>
          )}
        </div>

        {/* Books List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Buku oleh {author.name}
                <span className="ml-2 text-sm font-normal text-gray-400">({author.books?.length ?? 0} judul)</span>
              </h3>
            </div>

            {author.books?.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">Buku</th>
                    <th className="text-left px-5 py-3">Kategori</th>
                    <th className="text-left px-5 py-3">Tipe</th>
                    <th className="text-left px-5 py-3">Harga</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {author.books.map(book => (
                    <tr key={book.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {book.cover_image
                            ? <img src={book.cover_image} alt={book.title} className="w-8 h-11 object-cover rounded flex-shrink-0" />
                            : <div className="w-8 h-11 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center"><BookOpen className="h-4 w-4 text-gray-300" /></div>}
                          <span className="font-medium text-gray-900 line-clamp-2">{book.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{book.category?.name || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{book.book_type}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{formatRupiah(book.price)}</td>
                      <td className="px-5 py-3">
                        <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (book.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                          {book.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Belum ada buku untuk penulis ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
