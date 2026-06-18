import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import axios from 'axios';

function WishlistCard({ item }) {
  const { toggle } = useWishlistStore();
  const book = item.book;
  const finalPrice = book.discount_percent > 0
    ? Math.round(book.price * (1 - book.discount_percent / 100))
    : book.price;

  const handleRemove = async () => {
    await axios.post(route('wishlist.toggle', book.id));
    toggle(book.id);
    router.reload({ only: ['items'] });
  };

  const handleAddToCart = () => {
    router.post(route('cart.add'), { book_id: book.id, book_type: 'physical', quantity: 1 });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
      <Link href={route('catalog.show', book.slug)}>
        <img src={book.cover_image} alt={book.title} className="w-20 h-28 object-cover rounded-lg flex-shrink-0" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={route('catalog.show', book.slug)} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 text-sm">
          {book.title}
        </Link>
        <p className="text-xs text-gray-500 mt-1">{book.authors?.map(a => a.name).join(', ')}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-blue-600">{formatRupiah(finalPrice)}</span>
          {book.discount_percent > 0 && (
            <span className="text-xs text-gray-400 line-through">{formatRupiah(book.price)}</span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Tambah ke Keranjang
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <Heart className="h-3.5 w-3.5 fill-current" /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistIndex({ items }) {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Wishlist Saya</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Wishlist kamu masih kosong</p>
            <Link href={route('catalog.index')} className="text-blue-600 text-sm hover:underline">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
