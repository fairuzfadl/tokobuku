import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

function AuthorForm({ author, onClose }) {
  const isEdit = !!author;
  const [data, setData] = useState({ name: author?.name || '', bio: author?.bio || '', nationality: author?.nationality || '' });
  const [processing, setProcessing] = useState(false);
  const field = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    const action = isEdit
      ? router.put(route('admin.authors.update', author.id), data, { onFinish: () => setProcessing(false), onSuccess: onClose })
      : router.post(route('admin.authors.store'), data, { onFinish: () => setProcessing(false), onSuccess: onClose });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit Penulis' : 'Tambah Penulis'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nama *</label>
          <input value={data.name} onChange={e => field('name', e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kewarganegaraan</label>
          <input value={data.nationality} onChange={e => field('nationality', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Indonesia" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Biografi</label>
          <textarea value={data.bio} onChange={e => field('bio', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
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

export default function AdminAuthorsIndex({ authors }) {
  const [showForm, setShowForm] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);

  const handleDelete = (id, name) => {
    if (confirm(`Hapus penulis "${name}"?`)) router.delete(route('admin.authors.destroy', id));
  };

  return (
    <AdminLayout title="Manajemen Penulis">
      <div className="flex justify-end mb-5">
        <button onClick={() => { setEditAuthor(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah Penulis
        </button>
      </div>

      {(showForm || editAuthor) && (
        <AuthorForm author={editAuthor} onClose={() => { setShowForm(false); setEditAuthor(null); }} />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Slug</th>
              <th className="text-left px-5 py-3">Negara</th>
              <th className="text-left px-5 py-3">Jumlah Buku</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">{a.slug}</td>
                <td className="px-5 py-3 text-gray-500">{a.nationality || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{a.books_count || 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={route('admin.authors.show', a.id)} className="text-gray-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => { setEditAuthor(a); setShowForm(false); }} className="text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(a.id, a.name)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {authors.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada penulis</div>}
      </div>
    </AdminLayout>
  );
}
