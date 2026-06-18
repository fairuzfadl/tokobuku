import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { formatTanggalWaktu } from '@/utils/date';
import { Package, CheckCircle, Clock, Truck, Star, Download } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const STATUS_LABELS = {
  pending: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pembayaran Diterima', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Sedang Diproses', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' },
};

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Pesanan Dibuat', icon: Clock },
  { key: 'paid', label: 'Pembayaran Diterima', icon: CheckCircle },
  { key: 'processing', label: 'Diproses Penjual', icon: Package },
  { key: 'shipped', label: 'Dikirim', icon: Truck },
  { key: 'completed', label: 'Selesai', icon: Star },
];

const STATUS_ORDER = ['pending', 'paid', 'processing', 'shipped', 'completed'];

function OrderTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled' || status === 'refunded';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
        <Package className="h-5 w-5" />
        <span className="font-medium">{STATUS_LABELS[status]?.label}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {TIMELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={"absolute top-4 left-1/2 w-full h-0.5 z-0 " + (done ? 'bg-blue-500' : 'bg-gray-200')} />
              )}
              <div className={"relative z-10 w-8 h-8 rounded-full flex items-center justify-center " + (done || active ? 'bg-blue-600' : 'bg-gray-200')}>
                <Icon className={"h-4 w-4 " + (done || active ? 'text-white' : 'text-gray-400')} />
              </div>
              <p className={"text-xs mt-2 text-center " + (active ? 'text-blue-600 font-semibold' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_TRACK_COLOR = {
  DELIVERED: 'bg-green-100 text-green-700',
  ON_PROCESS: 'bg-blue-100 text-blue-700',
  PICKED_UP:  'bg-indigo-100 text-indigo-700',
};

function TrackingInfo({ courier, trackingNumber, orderNumber }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState(null);
  const [trackError, setTrackError] = useState(null);

  const handleOpen = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (trackData || trackError) return;
    setLoading(true);
    try {
      const res = await axios.get(route('orders.tracking', orderNumber));
      setTrackData(res.data);
    } catch (e) {
      setTrackError(e.response?.data?.error || 'Gagal memuat data tracking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-purple-50 rounded-xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Nomor Resi</p>
          <p className="font-bold text-purple-700 text-base font-mono">{trackingNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5 uppercase">{courier}</p>
        </div>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Truck className="h-4 w-4" />
          {open ? 'Sembunyikan' : 'Lacak Paket'}
        </button>
      </div>

      {open && (
        <div className="mt-4 border-t border-purple-200 pt-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Memuat data tracking...
            </div>
          )}
          {trackError && (
            <p className="text-sm text-red-500">{trackError}</p>
          )}
          {trackData && (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                <span className={"font-bold px-3 py-1 rounded-full text-xs " + (STATUS_TRACK_COLOR[trackData.summary?.status] || 'bg-gray-100 text-gray-700')}>
                  {trackData.summary?.status || '-'}
                </span>
                {trackData.detail?.origin && trackData.detail?.destination && (
                  <span className="text-gray-500">{trackData.detail.origin} → {trackData.detail.destination}</span>
                )}
                {trackData.summary?.desc && (
                  <span className="text-gray-700">{trackData.summary.desc}</span>
                )}
              </div>
              <div className="space-y-0 max-h-72 overflow-y-auto pr-1">
                {(trackData.history || []).map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={"w-3 h-3 rounded-full mt-1 flex-shrink-0 border-2 " + (i === 0 ? 'border-purple-600 bg-purple-600' : 'border-gray-300 bg-white')} />
                      {i < (trackData.history.length - 1) && <div className="w-0.5 bg-gray-200 flex-1 my-1" style={{ minHeight: '16px' }} />}
                    </div>
                    <div className="pb-3 flex-1">
                      <p className="text-xs text-gray-400">{h.date}</p>
                      <p className={"text-sm " + (i === 0 ? 'text-gray-900 font-medium' : 'text-gray-600')}>{h.desc}</p>
                      {h.location && <p className="text-xs text-purple-600 font-medium mt-0.5">{h.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl focus:outline-none"
        >
          <Star className={"h-7 w-7 " + ((hovered || value) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ item, orderId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Pilih rating terlebih dahulu.'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('book_id', item.book_id);
      form.append('order_id', orderId);
      form.append('rating', rating);
      if (title) form.append('title', title);
      if (body) form.append('body', body);
      if (image) form.append('image', image);

      await axios.post(route('reviews.store'), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
      <StarInput value={rating} onChange={setRating} />
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Judul ulasan (opsional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Tulis ulasanmu..."
        rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div>
        <label className="block text-xs text-gray-500 mb-1">Foto (opsional)</label>
        <input type="file" accept="image/*" onChange={handleImage} className="text-xs text-gray-600" />
        {preview && <img src={preview} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300"
      >
        {loading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}

export default function OrderShow({ order, canReview }) {
  const [showReviewFor, setShowReviewFor] = useState(null);
  const [reviewed, setReviewed] = useState({});
  const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  const handlePayNow = () => {
    router.visit(route('checkout.payment', order.order_number));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={route('orders.index')} className="text-gray-400 hover:text-gray-600">
            ← Pesanan Saya
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-1">{formatTanggalWaktu(order.created_at)}</p>
          </div>
          <span className={"text-sm font-medium px-3 py-1.5 rounded-full " + status.color}>
            {status.label}
          </span>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-6">Status Pesanan</h2>
          <OrderTimeline status={order.status} />
          {order.tracking_number && (
            <TrackingInfo courier={order.shipping_courier} trackingNumber={order.tracking_number} orderNumber={order.order_number} />
          )}
        </div>

        {/* Pay Now (if pending) */}
        {order.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800">Selesaikan pembayaranmu</p>
              <p className="text-sm text-yellow-700">Pesanan akan dibatalkan jika belum dibayar dalam 24 jam.</p>
            </div>
            <button onClick={handlePayNow} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              Bayar Sekarang
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Item Pesanan</h2>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id}>
                    <div className="flex gap-3">
                      <img src={item.book_cover} alt={item.book_title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.book_title}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.book_type === 'digital' ? 'Buku Digital' : 'Buku Fisik'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{item.quantity} × {formatRupiah(item.unit_price)}</p>
                          <p className="font-semibold text-blue-600 text-sm">{formatRupiah(item.subtotal)}</p>
                        </div>
                        {item.book_type === 'digital' && order.status === 'completed' && (
                          <a
                            href={route('orders.download', [order.order_number, item.id])}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" /> Unduh Buku Digital
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Review */}
                    {canReview && order.status === 'completed' && !item.review_id && !reviewed[item.id] && (
                      <div className="mt-2">
                        {showReviewFor === item.id ? (
                          <ReviewForm
                            item={item}
                            orderId={order.id}
                            onSuccess={() => {
                              setReviewed(r => ({ ...r, [item.id]: true }));
                              setShowReviewFor(null);
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => setShowReviewFor(item.id)}
                            className="text-xs text-blue-600 hover:underline mt-1"
                          >
                            + Tulis Ulasan
                          </button>
                        )}
                      </div>
                    )}
                    {(item.review_id || reviewed[item.id]) && (
                      <p className="text-xs text-green-600 mt-2">✓ Sudah diulas</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Alamat Pengiriman</h2>
              {order.address ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.address.recipient_name} — {order.address.label}</p>
                  <p>{order.address.full_address}</p>
                  <p>{order.address.city}, {order.address.province} {order.address.postal_code}</p>
                  <p>{order.address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Alamat tidak tersedia</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span>{formatRupiah(order.shipping_cost)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Voucher</span>
                    <span>-{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment info */}
            {order.payment && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3">Info Pembayaran</h2>
                <div className="text-sm space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Metode</span>
                    <span className="capitalize font-medium">{order.payment.payment_type?.replace(/_/g, ' ') || '-'}</span>
                  </div>
                  {order.payment.va_number && (
                    <div className="flex justify-between">
                      <span>No. VA</span>
                      <span className="font-mono font-medium">{order.payment.va_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="capitalize font-medium">{order.payment.payment_status || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice download */}
            {order.invoice_path && (
              <a
                href={route('orders.invoice', order.order_number)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm transition"
              >
                <Download className="h-4 w-4" /> Unduh Invoice
              </a>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-2">Catatan</h2>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
