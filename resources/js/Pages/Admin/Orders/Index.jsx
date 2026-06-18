import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { formatTanggalWaktu } from '@/utils/date';
import { Search } from 'lucide-react';
import { useState } from 'react';

const STATUS_LABELS = {
  pending: { label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Dibayar', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Diproses', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Batal', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refund', color: 'bg-gray-100 text-gray-800' },
};

const STATUS_TABS = ['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];

export default function AdminOrdersIndex({ orders, filters }) {
  const [search, setSearch] = useState(filters?.search || '');
  const currentStatus = filters?.status || 'all';

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.orders.index'), { search, status: currentStatus !== 'all' ? currentStatus : undefined }, { preserveState: true, replace: true });
  };

  const handleTabChange = (status) => {
    router.get(route('admin.orders.index'), { status: status !== 'all' ? status : undefined, search: search || undefined }, { preserveState: true, replace: true });
  };

  return (
    <AdminLayout title="Manajemen Pesanan">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => handleTabChange(s)}
            className={"whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition " + (currentStatus === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
          >
            {s === 'all' ? 'Semua' : STATUS_LABELS[s]?.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari no. pesanan atau nama pembeli..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          Cari
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">No. Pesanan</th>
              <th className="text-left px-5 py-3">Pembeli</th>
              <th className="text-left px-5 py-3">Total</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Tanggal</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.data.map(order => {
              const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
              return (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{order.order_number}</td>
                  <td className="px-5 py-3">{order.user?.name || '-'}</td>
                  <td className="px-5 py-3 font-medium">{formatRupiah(order.total)}</td>
                  <td className="px-5 py-3">
                    <span className={"text-xs font-medium px-2 py-1 rounded-full " + status.color}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatTanggalWaktu(order.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={route('admin.orders.show', order.order_number)} className="text-blue-600 hover:underline text-xs font-medium">
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.data.length === 0 && (
          <div className="text-center py-12 text-gray-400">Tidak ada pesanan ditemukan</div>
        )}
      </div>

      {orders.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {orders.links?.map((link, i) => (
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
