import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Mail, ShoppingBag, Calendar, Shield, User } from 'lucide-react';
import { formatTanggal } from '@/utils/date';
import { formatRupiah } from '@/utils/currency';

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0 w-36">{label}</span>
      <div className="text-sm text-gray-800 text-right">{children}</div>
    </div>
  );
}

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminUserShow({ user }) {
  return (
    <AdminLayout title={`Pengguna: ${user.name}`}>
      <div className="mb-5">
        <Link href={route('admin.users.index')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pengguna
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80&background=3b82f6&color=fff`}
                alt={user.name}
                className="w-16 h-16 rounded-full flex-shrink-0"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
              </div>
            </div>

            <div>
              <InfoRow label="Role">
                <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                  <Shield className="inline h-3 w-3 mr-1" />{user.role}
                </span>
              </InfoRow>
              <InfoRow label="Status">
                <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                  {user.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </InfoRow>
              <InfoRow label="Total Pesanan">
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />{user.orders_count ?? 0}
                </span>
              </InfoRow>
              <InfoRow label="Bergabung">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {formatTanggal(user.created_at)}
                </span>
              </InfoRow>
              <InfoRow label="Email Verifikasi">
                {user.email_verified_at
                  ? <span className="text-green-600 text-xs">Terverifikasi</span>
                  : <span className="text-yellow-600 text-xs">Belum terverifikasi</span>}
              </InfoRow>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Pesanan Terbaru
                <span className="ml-2 text-sm font-normal text-gray-400">({user.orders?.length ?? 0} terakhir)</span>
              </h3>
            </div>

            {user.orders?.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">No. Pesanan</th>
                    <th className="text-left px-5 py-3">Tanggal</th>
                    <th className="text-left px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {user.orders.map(order => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-700">{order.order_number}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatTanggal(order.created_at)}</td>
                      <td className="px-5 py-3 text-gray-800 font-medium">{formatRupiah(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600')}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={route('admin.orders.show', order.order_number)} className="text-blue-500 hover:text-blue-700 text-xs">
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
