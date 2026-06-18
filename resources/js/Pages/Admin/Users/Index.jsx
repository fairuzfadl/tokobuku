import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { formatTanggal } from '@/utils/date';
import { Search, UserCheck, UserX, Eye } from 'lucide-react';
import { useState } from 'react';

export default function AdminUsersIndex({ users, filters }) {
  const [search, setSearch] = useState(filters?.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.users.index'), { search }, { preserveState: true, replace: true });
  };

  const handleToggleActive = (id) => {
    router.patch(route('admin.users.toggleActive', id), {}, { preserveScroll: true });
  };

  const handleToggleAdmin = (id) => {
    if (confirm('Ubah role user ini?')) {
      router.patch(route('admin.users.toggleRole', id), {}, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout title="Manajemen Pengguna">
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          Cari
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Pengguna</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Daftar</th>
              <th className="text-left px-5 py-3">Total Pesanan</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.data.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32&background=3b82f6&color=fff`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{formatTanggal(user.created_at)}</td>
                <td className="px-5 py-3 text-gray-600">{user.orders_count || 0}</td>
                <td className="px-5 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={route('admin.users.show', user.id)} className="text-gray-400 hover:text-indigo-600">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleToggleActive(user.id)} title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'} className="text-gray-400 hover:text-blue-600">
                      {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.data.length === 0 && <div className="text-center py-12 text-gray-400">Tidak ada pengguna</div>}
      </div>

      {users.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {users.links?.map((link, i) => (
            <button
              key={i}
              disabled={!link.url}
              onClick={() => link.url && router.visit(link.url, { preserveState: true })}
              className={"px-3 py-1.5 rounded-lg text-sm " + (link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40')}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
