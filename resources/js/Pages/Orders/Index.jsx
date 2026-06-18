import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { formatTanggalWaktu } from '@/utils/date';
import { Package } from 'lucide-react';

const STATUS_LABELS = {
  pending: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pembayaran Diterima', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Diproses', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' },
};

const TABS = ['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];

export default function OrdersIndex({ orders, currentStatus }) {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {TABS.map(status => (
            <Link
              key={status}
              href={status === 'all' ? route('orders.index') : route('orders.index', { status })}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                (status === 'all' && !currentStatus) || currentStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Semua' : STATUS_LABELS[status]?.label}
            </Link>
          ))}
        </div>

        {orders.data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada pesanan</p>
            <Link href={route('catalog.index')} className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.data.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">{formatTanggalWaktu(order.created_at)}</p>
                    <p className="font-mono text-sm font-medium text-gray-800">{order.order_number}</p>
                  </div>
                  <span className={"text-xs font-medium px-3 py-1 rounded-full " + (STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-800')}>
                    {STATUS_LABELS[order.status]?.label || order.status}
                  </span>
                </div>

                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {order.items?.slice(0, 4).map(item => (
                    <img key={item.id} src={item.book_cover} alt={item.book_title} className="w-12 h-16 object-cover rounded" />
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">{order.items?.length} item • </span>
                    <span className="font-bold text-blue-600">{formatRupiah(order.total)}</span>
                  </div>
                  <Link
                    href={route('orders.show', order.order_number)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
