import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { ShoppingCart, Heart, User, Search, BookOpen, Menu } from 'lucide-react';

export default function MainLayout({ children, title }) {
  const { auth, cart_count, wishlist_ids, flash, settings } = usePage().props;
  const { count, setCount } = useCartStore();
  const { setIds } = useWishlistStore();

  useEffect(() => {
    setCount(cart_count || 0);
    setIds(wishlist_ids || []);
  }, [cart_count, wishlist_ids]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={route('home')} className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <BookOpen className="h-7 w-7" />
              <span>{settings?.site_name || 'TokoBuku'}</span>
            </Link>

            {/* Search */}
            <form action={route('catalog.index')} method="GET" className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  name="q"
                  placeholder="Cari buku, penulis, ISBN..."
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href={route('cart.index')} className="relative p-2 text-gray-600 hover:text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>

              {auth.user && (
                <Link href={route('wishlist.index')} className="p-2 text-gray-600 hover:text-red-500">
                  <Heart className="h-6 w-6" />
                </Link>
              )}

              {auth.user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:block">{auth.user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href={route('profile.index')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profil Saya</Link>
                    <Link href={route('profile.addresses.index')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Alamat Saya</Link>
                    <Link href={route('orders.index')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pesanan Saya</Link>
                    {auth.user.role === 'admin' && (
                      <Link href={route('admin.dashboard')} className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">Dashboard Admin</Link>
                    )}
                    <hr className="my-1" />
                    <Link href={route('logout')} method="post" as="button" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Keluar
                    </Link>
                  </div>
                </div>
              ) : (
                <Link href={route('login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Flash Messages */}
      {flash?.success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 mx-4 mt-3 rounded">
          <p className="text-green-800 text-sm">{flash.success}</p>
        </div>
      )}
      {flash?.error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mx-4 mt-3 rounded">
          <p className="text-red-800 text-sm">{flash.error}</p>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span>TokoBuku</span>
              </div>
              <p className="text-sm">Platform jual beli buku terlengkap di Indonesia.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Kategori</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href={route('catalog.index')} className="hover:text-white">Semua Buku</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Bantuan</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Pembayaran</h3>
              <p className="text-sm">Transfer Bank, QRIS, GoPay, OVO, Dana, ShopeePay, Kartu Kredit</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} TokoBuku. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
