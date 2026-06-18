import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/utils/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AdminReportsIndex({ salesChart, topBooks, stats, filters }) {
  const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
  const [dateTo, setDateTo] = useState(filters?.date_to || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.index'), { date_from: dateFrom, date_to: dateTo }, { preserveState: true, replace: true });
  };

  const exportUrl = (type) => {
    const params = new URLSearchParams({ type, date_from: dateFrom, date_to: dateTo }).toString();
    return route('admin.reports.export') + '?' + params;
  };

  return (
    <AdminLayout title="Laporan Penjualan">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Terapkan Filter
          </button>
          <div className="ml-auto flex gap-2">
            <a href={exportUrl('excel')} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </a>
            <a href={exportUrl('pdf')} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <FileText className="h-4 w-4" /> Export PDF
            </a>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pesanan', value: stats?.total_orders },
          { label: 'Pesanan Selesai', value: stats?.completed_orders },
          { label: 'Total Pendapatan', value: formatRupiah(stats?.total_revenue || 0) },
          { label: 'Rata-rata Pesanan', value: formatRupiah(stats?.avg_order || 0) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Penjualan Harian</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesChart}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => 'Rp' + (v/1000000).toFixed(1) + 'jt'} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => formatRupiah(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Books */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Buku Terlaris</h2>
          <div className="space-y-3">
            {topBooks?.map((book, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i+1}</span>
                {book.cover_image
                  ? <img src={book.cover_image} alt={book.title} className="w-8 h-11 object-cover rounded flex-shrink-0" />
                  : <div className="w-8 h-11 bg-gray-100 rounded flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.total_sold} terjual</p>
                </div>
              </div>
            ))}
            {(!topBooks || topBooks.length === 0) && <p className="text-sm text-gray-400">Belum ada data</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
