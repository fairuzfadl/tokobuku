import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { formatTanggal } from '@/utils/date';
import { Star, CheckCircle, XCircle } from 'lucide-react';

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={"h-3.5 w-3.5 " + (s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200')} />
      ))}
    </div>
  );
}

export default function AdminReviewsIndex({ reviews }) {
  const handleApprove = (id) => {
    router.patch(route('admin.reviews.approve', id), {}, { preserveScroll: true });
  };

  const handleReject = (id) => {
    if (confirm('Tolak dan hapus ulasan ini?')) {
      router.delete(route('admin.reviews.destroy', id));
    }
  };

  return (
    <AdminLayout title="Moderasi Ulasan">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Pengguna</th>
              <th className="text-left px-5 py-3">Buku</th>
              <th className="text-left px-5 py-3">Rating & Ulasan</th>
              <th className="text-left px-5 py-3">Tanggal</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reviews.data.map(review => (
              <tr key={review.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{review.user?.name}</p>
                  <p className="text-xs text-gray-400">{review.user?.email}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{review.book?.title}</p>
                </td>
                <td className="px-5 py-3 max-w-xs">
                  <Stars rating={review.rating} />
                  {review.title && <p className="font-medium text-xs text-gray-800 mt-1">{review.title}</p>}
                  {review.body && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{review.body}</p>}
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{formatTanggal(review.created_at)}</td>
                <td className="px-5 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                    {review.is_approved ? 'Disetujui' : 'Menunggu'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {!review.is_approved && (
                      <button onClick={() => handleApprove(review.id)} title="Setujui" className="text-gray-400 hover:text-green-600">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleReject(review.id)} title="Hapus" className="text-gray-400 hover:text-red-600">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.data.length === 0 && <div className="text-center py-12 text-gray-400">Tidak ada ulasan</div>}
      </div>

      {reviews.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {reviews.links?.map((link, i) => (
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
