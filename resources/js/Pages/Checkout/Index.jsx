import MainLayout from '@/Layouts/MainLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { useState } from 'react';
import { MapPin, Truck, Tag, AlertTriangle } from 'lucide-react';

export default function CheckoutIndex({ cart, addresses, flat_shipping_cost, free_shipping_threshold }) {
  const { settings } = usePage().props;
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.is_default)?.id || addresses[0]?.id);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState(null);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.price_snapshot * i.quantity), 0);
  const isFreeShipping = free_shipping_threshold > 0 && subtotal >= free_shipping_threshold;
  const shippingCost = isFreeShipping ? 0 : (flat_shipping_cost ?? 0);
  const overStockItems = items.filter(i => i.book_type === 'physical' && i.quantity > (i.book?.stock ?? 0));
  const hasOverStock = overStockItems.length > 0;

  const { data, setData, post, processing, errors } = useForm({
    address_id: selectedAddress,
    shipping_courier: '',
    shipping_service: '',
    shipping_cost: shippingCost,
    voucher_code: '',
    notes: '',
  });

  const applyVoucher = async () => {
    const res = await fetch(route('checkout.voucher'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
      body: JSON.stringify({ code: voucherCode, cart_total: subtotal }),
    });
    const json = await res.json();
    setVoucherMsg(json);
    if (json.valid) setData('voucher_code', voucherCode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('checkout.store'));
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
        {hasOverStock && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Beberapa item melebihi stok tersedia:</p>
              <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                {overStockItems.map(i => (
                  <li key={i.id}>{i.book?.title} — diminta {i.quantity}, stok cuma {i.book?.stock ?? 0}</li>
                ))}
              </ul>
              <Link href={route('cart.index')} className="inline-block mt-2 text-xs font-medium text-red-700 underline hover:text-red-800">
                Kembali ke keranjang untuk memperbaiki
              </Link>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Address + Shipping */}
            <div className="lg:col-span-2 space-y-4">
              {/* Alamat */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" /> Alamat Pengiriman
                </h2>
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-sm">Belum ada alamat. <a href={route('profile.addresses.index')} className="text-blue-600">Tambah alamat</a></p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map(addr => (
                      <label key={addr.id} className={"flex gap-3 p-3 border rounded-xl cursor-pointer " + (data.address_id == addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}>
                        <input
                          type="radio"
                          name="address_id"
                          value={addr.id}
                          checked={data.address_id == addr.id}
                          onChange={() => setData('address_id', addr.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-sm">{addr.label} — {addr.recipient_name}</p>
                          <p className="text-xs text-gray-500">{addr.full_address}, {addr.city}, {addr.province} {addr.postal_code}</p>
                          <p className="text-xs text-gray-500">{addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Catatan */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3">Catatan (opsional)</h2>
                <textarea
                  value={data.notes}
                  onChange={e => setData('notes', e.target.value)}
                  placeholder="Catatan untuk penjual..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Voucher */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-600" /> Kode Voucher
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode voucher"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={applyVoucher} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Pakai
                  </button>
                </div>
                {voucherMsg && (
                  <p className={"text-sm mt-2 " + (voucherMsg.valid ? 'text-green-600' : 'text-red-500')}>
                    {voucherMsg.valid ? `✓ Voucher berhasil diterapkan` : voucherMsg.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5 h-fit">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1">{item.book?.title} ×{item.quantity}</span>
                    <span className="font-medium ml-2">{formatRupiah(item.price_snapshot * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  {isFreeShipping
                    ? <span className="text-green-600 font-medium">Gratis</span>
                    : <span>{formatRupiah(shippingCost)}</span>}
                </div>
                {free_shipping_threshold > 0 && !isFreeShipping && (
                  <p className="text-xs text-gray-400 mt-1">
                    Belanja {formatRupiah(free_shipping_threshold - subtotal)} lagi untuk gratis ongkir
                  </p>
                )}
              </div>
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(subtotal + shippingCost)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={processing || addresses.length === 0 || hasOverStock}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
              >
                {processing ? 'Memproses...' : hasOverStock ? 'Stok Tidak Mencukupi' : 'Lanjut ke Pembayaran'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
