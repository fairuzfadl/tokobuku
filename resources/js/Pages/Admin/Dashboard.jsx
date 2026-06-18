import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/utils/currency';
import { formatTanggal } from '@/utils/date';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, DollarSign, Users, BookOpen, AlertCircle, Package } from 'lucide-react';
import { Link } from '@inertiajs/react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={"rounded-xl p-3 " + color}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  pending: 'Menunggu Bayar', paid: 'Dibayar', processing: 'Diproses',
  shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Batal',
};

export default function Dashboard({ stats, salesChart, recentOrders }) {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ShoppingBag} label="Pesanan Hari Ini" value={stats.total_orders_today} color="bg-blue-500" />
        <StatCard icon={DollarSign} label="Pendapatan Hari Ini" value={formatRupiah(stats.revenue_today)} color="bg-green-500" />
        <StatCard icon={Users} label="Total Pengguna" value={stats.total_users} color="bg-purple-500" />
        <StatCard icon={BookOpen} label="Total Buku" value={stats.total_books} color="bg-orange-500" />
        <StatCard icon={Package} label="Pesanan Pending" value={stats.pending_orders} color="bg-yellow-500" />
        <StatCard icon={AlertCircle} label="Stok Menipis" value={stats.low_stock_books} color="bg-red-500" />
        <StatCard icon={DollarSign} label="Pesanan Bulan Ini" value={stats.total_orders_month} color="bg-teal-500" />
        <StatCard icon={DollarSign} label="Pendapatan Bulan Ini" value={formatRupiah(stats.revenue_month)} color="bg-indigo-500" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="font-bold text-gray-800 mb-4">Penjualan 30 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={salesChart}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => 'Rp' + (v/1000000).toFixed(1) + 'jt'} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatRupiah(v)} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Pesanan Terbaru</h2>
          <Link href={route('admin.orders.index')} className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3">No. Pesanan</th>
              <th className="text-left px-5 py-3">Pembeli</th>
              <th className="text-left px-5 py-3">Total</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-mono">
                  <Link href={route('admin.orders.show', order.order_number)} className="text-blue-600 hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-5 py-3">{order.user?.name}</td>
                <td className="px-5 py-3 font-medium">{formatRupiah(order.total)}</td>
                <td className="px-5 py-3">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{formatTanggal(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
