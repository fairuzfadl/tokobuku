import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

function CategoryForm({ category, categories, onClose }) {
  const isEdit = !!category;
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: category?.name || '',
    parent_id: category?.parent_id || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = isEdit
      ? () => router.put(route('admin.categories.update', category.id), data, { onSuccess: () => { reset(); onClose(); } })
      : () => router.post(route('admin.categories.store'), data, { onSuccess: () => { reset(); onClose(); } });
    action();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nama Kategori *</label>
          <input
            value={data.name}
            onChange={e => setData('name', e.target.value)}
            required
            className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.name ? 'border-red-400' : 'border-gray-200')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategori Induk</label>
            <select
              value={data.parent_id}
              onChange={e => setData('parent_id', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Tidak Ada —</option>
              {categories.filter(c => !category || c.id !== category.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Urutan</label>
            <input
              type="number"
              value={data.sort_order}
              onChange={e => setData('sort_order', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
          <span className="text-sm text-gray-700">Aktif</span>
        </label>
        <div className="flex gap-3">
          <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300">
            {processing ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Batal</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCategoriesIndex({ categories }) {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const handleToggle = (id) => {
    router.patch(route('admin.categories.toggleActive', id), {}, { preserveScroll: true });
  };

  const handleDelete = (id, name) => {
    if (confirm(`Hapus kategori "${name}"?`)) {
      router.delete(route('admin.categories.destroy', id));
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="flex justify-end mb-5">
        <button
          onClick={() => { setEditCategory(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      {(showForm || editCategory) && (
        <CategoryForm
          category={editCategory}
          categories={categories}
          onClose={() => { setShowForm(false); setEditCategory(null); }}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Slug</th>
              <th className="text-left px-5 py-3">Induk</th>
              <th className="text-left px-5 py-3">Urutan</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">{cat.slug}</td>
                <td className="px-5 py-3 text-gray-500">{cat.parent?.name || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{cat.sort_order}</td>
                <td className="px-5 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {cat.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={route('admin.categories.show', cat.id)} className="text-gray-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => { setEditCategory(cat); setShowForm(false); }} className="text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleToggle(cat.id)} title={cat.is_active ? 'Nonaktifkan' : 'Aktifkan'} className={cat.is_active ? 'text-green-500 hover:text-yellow-500' : 'text-gray-300 hover:text-green-500'}>
                      {cat.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada kategori</div>}
      </div>
    </AdminLayout>
  );
}
