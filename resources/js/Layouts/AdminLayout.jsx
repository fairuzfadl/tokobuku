import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, BookOpen, Tag, Users, ShoppingBag, BarChart2, Star, Image, Ticket, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: 'admin.dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: 'admin.books.index', label: 'Buku', icon: BookOpen },
  { href: 'admin.categories.index', label: 'Kategori', icon: Tag },
  { href: 'admin.authors.index', label: 'Penulis', icon: Users },
  { href: 'admin.publishers.index', label: 'Penerbit', icon: BookOpen },
  { href: 'admin.orders.index', label: 'Pesanan', icon: ShoppingBag },
  { href: 'admin.users.index', label: 'Pengguna', icon: Users },
  { href: 'admin.vouchers.index', label: 'Voucher', icon: Ticket },
  { href: 'admin.banners.index', label: 'Banner', icon: Image },
  { href: 'admin.reviews.index', label: 'Ulasan', icon: Star },
  { href: 'admin.reports.index', label: 'Laporan', icon: BarChart2 },
  { href: 'admin.settings.index', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout({ children, title }) {
  const page = usePage();
  const { auth, flash } = page.props;
  const currentUrl = page.url ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const [visibleFlash, setVisibleFlash] = useState(null);

  useEffect(() => {
    if (flash?.success || flash?.error) {
      setVisibleFlash(flash);
      const t = setTimeout(() => setVisibleFlash(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  const isNavActive = (routeName) => {
    try {
      const routePath = new URL(route(routeName)).pathname;
      if (routeName === 'admin.dashboard') {
        return currentUrl === routePath || currentUrl === '/admin';
      }
      return currentUrl.startsWith(routePath);
    } catch {
      return false;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href={route('admin.dashboard')} className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span>TokoBuku Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={route(href)}
              className={"flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors " + (isNavActive(href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">{auth.user?.name}</p>
          <Link href={route('home')} className="text-xs text-blue-400 hover:text-blue-300">← Ke Toko</Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </header>

        <main className="flex-1 p-6">
          {visibleFlash?.success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
              <span>{visibleFlash.success}</span>
              <button onClick={() => setVisibleFlash(null)} className="ml-4 text-green-600 hover:text-green-800 text-lg leading-none">&times;</button>
            </div>
          )}
          {visibleFlash?.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
              <span>{visibleFlash.error}</span>
              <button onClick={() => setVisibleFlash(null)} className="ml-4 text-red-600 hover:text-red-800 text-lg leading-none">&times;</button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
