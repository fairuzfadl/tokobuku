import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { formatTanggalWaktu } from '@/utils/date';
import { useState } from 'react';
import { Truck, ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Pembayaran Diterima' },
  { value: 'processing', label: 'Sedang Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'refunded', label: 'Dikembalikan' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminOrderShow({ order }) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [shipping, setShipping] = useState(order.shipping_courier || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = () => {
    setUpdating(true);
    router.patch(route('admin.orders.updateStatus', order.order_number), {
      status, tracking_number: trackingNumber, shipping_courier: shipping,
    }, {
      preserveScroll: true,
      onFinish: () => setUpdating(false),
    });
  };

  return (
    <AdminLayout title={`Pesanan ${order.order_number}`}>
      <div className="mb-5">
        <Link href={route('admin.orders.index')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pesanan
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Left: Items + address */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order items */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Item Pesanan ({order.items?.length})</h2>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.book_cover} alt={item.book_title} className="w-12 h-16 object-cover rounded flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{item.book_title}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.book_type === 'digital' ? 'Digital' : 'Fisik'} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Alamat Pengiriman</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">{order.address.recipient_name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.full_address}</p>
                <p>{order.address.city}, {order.address.province} {order.address.postal_code}</p>
              </div>
            </div>
          )}

          {/* Payment info */}
          {order.payment && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Info Pembayaran</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Midtrans Order ID</span>
                  <span className="font-mono text-gray-900">{order.payment.midtrans_order_id}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Metode</span>
                  <span className="capitalize">{order.payment.payment_type?.replace(/_/g, ' ') || '-'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status Pembayaran</span>
                  <span className="capitalize font-medium">{order.payment.payment_status}</span>
                </div>
                {order.payment.paid_at && (
                  <div className="flex justify-between text-gray-600">
                    <span>Dibayar</span>
                    <span>{formatTanggalWaktu(order.payment.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Status management + summary */}
        <div className="space-y-4">
          {/* Status update */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status Pesanan</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {(status === 'shipped' || order.shipping_courier) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kurir</label>
                    <select
                      value={shipping}
                      onChange={e => setShipping(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih Kurir --</option>
                      <option value="JNE">JNE</option>
                      <option value="J&T">J&T Express</option>
                      <option value="SiCepat">SiCepat</option>
                      <option value="Anteraja">Anteraja</option>
                      <option value="TIKI">TIKI</option>
                      <option value="Pos Indonesia">Pos Indonesia</option>
                      <option value="SAP">SAP Express</option>
                      <option value="Ninja Express">Ninja Express</option>
                      <option value="Lion Parcel">Lion Parcel</option>
                      <option value="Wahana">Wahana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nomor Resi</label>
                    <input
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="Masukkan nomor resi"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                {updating ? 'Menyimpan...' : 'Simpan Status'}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Ringkasan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">No. Pesanan</span>
                <span className="font-mono text-xs">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pembeli</span>
                <span>{order.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="text-xs">{formatTanggalWaktu(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800')}>
                  {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                </span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkir</span>
                  <span>{formatRupiah(order.shipping_cost)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice */}
          {order.invoice_path && (
            <a
              href={route('admin.orders.invoice', order.order_number)}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-sm"
            >
              Download Invoice PDF
            </a>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
