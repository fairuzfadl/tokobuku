import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

function PublisherForm({ publisher, onClose }) {
  const isEdit = !!publisher;
  const [data, setData] = useState({
    name: publisher?.name || '',
    description: publisher?.description || '',
    city: publisher?.city || '',
    website: publisher?.website || '',
  });
  const [processing, setProcessing] = useState(false);
  const field = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    const action = isEdit
      ? router.put(route('admin.publishers.update', publisher.id), data, { onFinish: () => setProcessing(false), onSuccess: onClose })
      : router.post(route('admin.publishers.store'), data, { onFinish: () => setProcessing(false), onSuccess: onClose });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit Penerbit' : 'Tambah Penerbit'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nama Penerbit *</label>
          <input value={data.name} onChange={e => field('name', e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kota</label>
            <input value={data.city} onChange={e => field('city', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jakarta" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
            <input value={data.website} onChange={e => field('website', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
          <textarea value={data.description} onChange={e => field('description', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

export default function AdminPublishersIndex({ publishers }) {
  const [showForm, setShowForm] = useState(false);
  const [editPublisher, setEditPublisher] = useState(null);

  const handleDelete = (id, name) => {
    if (confirm(`Hapus penerbit "${name}"?`)) router.delete(route('admin.publishers.destroy', id));
  };

  return (
    <AdminLayout title="Manajemen Penerbit">
      <div className="flex justify-end mb-5">
        <button onClick={() => { setEditPublisher(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah Penerbit
        </button>
      </div>

      {(showForm || editPublisher) && (
        <PublisherForm publisher={editPublisher} onClose={() => { setShowForm(false); setEditPublisher(null); }} />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Kota</th>
              <th className="text-left px-5 py-3">Website</th>
              <th className="text-left px-5 py-3">Jumlah Buku</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-5 py-3 text-gray-500">{p.city || '—'}</td>
                <td className="px-5 py-3">
                  {p.website ? <a href={p.website} target="_blank" className="text-blue-600 hover:underline text-xs">{p.website}</a> : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-500">{p.books_count || 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={route('admin.publishers.show', p.id)} className="text-gray-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></Link>
                    <button onClick={() => { setEditPublisher(p); setShowForm(false); }} className="text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {publishers.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada penerbit</div>}
      </div>
    </AdminLayout>
  );
}
