import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { Trash2, ShoppingCart, ArrowRight, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

function CartItemRow({ item, onRemove, onQtyChange }) {
  const [localQty, setLocalQty] = useState(String(item.quantity));
  const isPhysical = item.book_type === 'physical';
  const stock = item.book?.stock ?? 0;
  const overStock = isPhysical && item.quantity > stock;
  const maxQty = isPhysical ? Math.max(1, stock) : 99;

  useEffect(() => { setLocalQty(String(item.quantity)); }, [item.quantity]);

  const commit = (val) => {
    const v = parseInt(val, 10);
    let final = !isNaN(v) && v >= 1 ? v : 1;
    if (isPhysical && final > stock) final = stock;
    setLocalQty(String(final));
    if (final !== item.quantity) onQtyChange(item.id, final);
  };

  const decrement = () => commit(Math.max(1, (parseInt(localQty) || 1) - 1));
  const increment = () => {
    const next = (parseInt(localQty) || 1) + 1;
    if (isPhysical && next > stock) return;
    commit(next);
  };

  return (
    <div className={"flex items-center gap-4 py-4 border-b last:border-0 " + (overStock ? 'bg-red-50/40 -mx-2 px-2 rounded' : '')}>
      <img src={item.book?.cover_image} alt={item.book?.title} className="w-16 h-20 object-cover rounded-lg" />
      <div className="flex-1">
        <Link href={route('catalog.show', item.book?.slug)} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
          {item.book?.title}
        </Link>
        <p className="text-sm text-gray-500">{item.book?.authors?.map(a => a.name).join(', ')}</p>
        <p className="text-sm text-gray-500 capitalize">{isPhysical ? 'Buku Fisik' : 'Buku Digital'}</p>
        {isPhysical && (
          overStock ? (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Stok cuma {stock}, jumlah di keranjang melebihi.
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Stok: {stock} tersisa</p>
          )
        )}
      </div>
      <div className="flex items-center border rounded-lg">
        <button onClick={decrement} className="px-3 py-1 text-gray-600 hover:bg-gray-100 text-lg">-</button>
        <input
          type="text"
          inputMode="numeric"
          value={localQty}
          onChange={e => setLocalQty(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => commit(localQty)}
          onKeyDown={e => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
          className="w-12 text-center py-1 font-medium border-x focus:outline-none"
        />
        <button
          onClick={increment}
          disabled={isPhysical && (parseInt(localQty) || 1) >= stock}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >+</button>
      </div>
      <div className="text-right">
        <p className="font-bold text-blue-600">{formatRupiah(item.price_snapshot * (parseInt(localQty) || 1))}</p>
        <p className="text-xs text-gray-400">{formatRupiah(item.price_snapshot)} / item</p>
      </div>
      <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 p-2">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function CartIndex({ cart }) {
  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + (i.price_snapshot * i.quantity), 0);
  const hasOverStock = items.some(i => i.book_type === 'physical' && i.quantity > (i.book?.stock ?? 0));

  const handleQtyChange = (itemId, qty) => {
    router.patch(route('cart.update', itemId), { quantity: qty }, { preserveScroll: true });
  };

  const handleRemove = (itemId) => {
    router.delete(route('cart.remove', itemId), { preserveScroll: true });
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingCart className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-8">Belum ada buku di keranjangmu. Yuk, mulai belanja!</p>
          <Link href={route('catalog.index')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700">
            Lihat Katalog
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item list */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            {items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="font-bold text-gray-900 mb-4">Ringkasan Belanja</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Total ({items.length} item)</span>
                <span className="font-medium text-gray-900">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="text-gray-400">Dihitung saat checkout</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span className="text-blue-600">{formatRupiah(total)}</span>
              </div>
            </div>
            {hasOverStock && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  Ada item yang jumlahnya melebihi stok tersedia. Kurangi dulu sebelum checkout.
                </p>
              </div>
            )}
            {hasOverStock ? (
              <button
                disabled
                className="w-full bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href={route('checkout.index')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href={route('catalog.index')} className="w-full text-center block mt-3 text-sm text-gray-500 hover:text-blue-600">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
