import { Link } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { useWishlistStore } from '@/stores/wishlistStore';
import { usePage } from '@inertiajs/react';
import { Heart, Star } from 'lucide-react';
import axios from 'axios';

export default function BookCard({ book }) {
  const { auth } = usePage().props;
  const { isWishlisted, toggle } = useWishlistStore();
  const wishlisted = isWishlisted(book.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
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
    <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link href={route('catalog.show', book.slug)} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {book.discount_percent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{book.discount_percent}%
            </span>
          )}
          {book.book_type === 'digital' && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Digital</span>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1 truncate">
            {book.authors?.map(a => a.name).join(', ') || '-'}
          </p>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{book.title}</h3>
          <div className="flex items-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={"h-3 w-3 " + (s <= Math.round(book.rating_avg ?? 0) && book.rating_count > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200")} />
            ))}
            {book.rating_count > 0
              ? <span className="text-xs text-gray-500 ml-1">({book.rating_count})</span>
              : <span className="text-xs text-gray-300 ml-1">Belum ada ulasan</span>}
          </div>
          <div>
            {isDiscountActive ? (
              <>
                <p className="text-xs text-gray-400 line-through">{formatRupiah(book.price)}</p>
                <p className="font-bold text-blue-600">{formatRupiah(finalPrice)}</p>
              </>
            ) : (
              <p className="font-bold text-blue-600">{formatRupiah(book.price)}</p>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2"
        aria-label="Wishlist"
      >
        <Heart className={`h-5 w-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white drop-shadow'}`} />
      </button>
    </div>
  );
}
