import MainLayout from '@/Layouts/MainLayout';
import BookCard from '@/Components/Catalog/BookCard';
import { Link, router, usePage } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { useWishlistStore } from '@/stores/wishlistStore';
import { ShoppingCart, Heart, Star, Package } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={"h-4 w-4 " + (s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
      ))}
      {count > 0 && <span className="text-sm text-gray-600 ml-1">{parseFloat(rating).toFixed(1)} ({count} ulasan)</span>}
    </div>
  );
}

export default function CatalogShow({ book, reviews, related }) {
  const { auth } = usePage().props;
  const { isWishlisted, toggle } = useWishlistStore();
  const [qty, setQty] = useState('1');
  const [processing, setProcessing] = useState(false);

  const addToCart = () => {
    setProcessing(true);
    router.post(route('cart.add'), {
      book_id: book.id,
      book_type: book.book_type === 'digital' ? 'digital' : 'physical',
      quantity: parseInt(qty) || 1,
    }, {
      preserveScroll: true,
      onFinish: () => setProcessing(false),
    });
  };

  const handleWishlist = async () => {
    if (!auth.user) { window.location = route('login'); return; }
    toggle(book.id);
    await axios.post(route('wishlist.toggle', book.id));
  };

  const isDiscountActive = book.discount_percent > 0 &&
    (!book.discount_until || new Date(book.discount_until) > new Date());
  const finalPrice = isDiscountActive
    ? book.price * (1 - book.discount_percent / 100)
    : book.price;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href={route('home')} className="hover:text-blue-600">Beranda</Link>
          {' / '}
          <Link href={route('catalog.index')} className="hover:text-blue-600">Katalog</Link>
          {' / '}
          <span className="text-gray-800">{book.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cover */}
            <div className="md:col-span-1">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 space-y-4">
              {book.category && (
                <Link href={route('category.show', book.category.slug)} className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  {book.category.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-gray-600">
                oleh <span className="font-medium text-blue-600">
                  {book.authors?.map(a => a.name).join(', ')}
                </span>
              </p>
              <StarRating rating={book.rating_avg} count={book.rating_count} />

              <div className="bg-gray-50 rounded-xl p-4">
                {isDiscountActive ? (
                  <div>
                    <p className="text-gray-400 line-through text-sm">{formatRupiah(book.price)}</p>
                    <p className="text-3xl font-bold text-red-600">{formatRupiah(finalPrice)}</p>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-medium">
                      Hemat {book.discount_percent}%
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-blue-600">{formatRupiah(book.price)}</p>
                )}
              </div>

              {book.book_type !== 'digital' && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className={book.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                    {book.stock > 0 ? `Stok: ${book.stock}` : 'Stok Habis'}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQty(q => String(Math.max(1, (parseInt(q) || 1) - 1)))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={qty}
                      onChange={e => setQty(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => setQty(q => String(Math.max(1, parseInt(q) || 1)))}
                      className="w-14 text-center py-2 font-medium border-x focus:outline-none"
                    />
                    <button onClick={() => setQty(q => String((parseInt(q) || 1) + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={processing || (book.book_type !== 'digital' && book.stock === 0)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {processing ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                  </button>
                  <button onClick={handleWishlist} className="p-2 border rounded-lg hover:bg-red-50">
                    <Heart className={"h-5 w-5 " + (isWishlisted(book.id) ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                  </button>
                </div>
                {(parseInt(qty) || 1) > 1 && (
                  <p className="text-sm text-gray-500">
                    Total: <span className="font-semibold text-blue-600">{formatRupiah(finalPrice * (parseInt(qty) || 1))}</span>
                    <span className="text-gray-400 ml-1">({qty} × {formatRupiah(finalPrice)})</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 pt-4 border-t">
                {book.isbn && <p><span className="font-medium">ISBN:</span> {book.isbn}</p>}
                {book.publisher && <p><span className="font-medium">Penerbit:</span> {book.publisher.name}</p>}
                {book.pages && <p><span className="font-medium">Halaman:</span> {book.pages}</p>}
                {book.language && <p><span className="font-medium">Bahasa:</span> {book.language}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        {book.synopsis && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi</h2>
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: book.synopsis }} />
          </div>
        )}

        {/* Ulasan */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ulasan Pembeli ({reviews.total})</h2>
          {reviews.data.length === 0 ? (
            <p className="text-gray-500">Belum ada ulasan.</p>
          ) : (
            <div className="space-y-4">
              {reviews.data.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {review.user?.name[0]}
                    </div>
                    <span className="font-medium text-sm">{review.user?.name}</span>
                    <StarRating rating={review.rating} count={0} />
                  </div>
                  {review.title && <p className="font-medium text-sm">{review.title}</p>}
                  {review.body && <p className="text-gray-600 text-sm mt-1">{review.body}</p>}
                  {review.image && <img src={review.image} alt="foto ulasan" className="mt-2 h-32 rounded-lg object-cover" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buku Serupa */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Buku Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
