import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { formatTanggal } from '@/utils/date';
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useRef } from 'react';

function BannerForm({ banner, onClose }) {
  const isEdit = !!banner;
  const [data, setData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    link: banner?.link || '',
    sort_order: banner?.sort_order || 0,
    starts_at: banner?.starts_at?.slice(0,10) || '',
    ends_at: banner?.ends_at?.slice(0,10) || '',
    is_active: banner?.is_active ?? true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(banner?.image || null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    if (image) form.append('image', image);
    if (isEdit) form.append('_method', 'PUT');
    const url = isEdit ? route('admin.banners.update', banner.id) : route('admin.banners.store');
    router.post(url, form, { forceFormData: true, onFinish: () => setProcessing(false), onSuccess: onClose });
  };

  const field = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit Banner' : 'Tambah Banner'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gambar Banner</label>
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden">
            {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Klik untuk upload gambar</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Judul</label>
            <input value={data.title} onChange={e => field('title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subjudul</label>
            <input value={data.subtitle} onChange={e => field('subtitle', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Link (URL)</label>
          <input value={data.link} onChange={e => field('link', e.target.value)} placeholder="/katalog" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Urutan</label>
            <input type="number" value={data.sort_order} onChange={e => field('sort_order', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mulai</label>
            <input type="date" value={data.starts_at} onChange={e => field('starts_at', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Berakhir</label>
            <input type="date" value={data.ends_at} onChange={e => field('ends_at', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.is_active} onChange={e => field('is_active', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
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

export default function AdminBannersIndex({ banners }) {
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState(null);

  const handleToggle = (id) => {
    router.patch(route('admin.banners.toggleActive', id), {}, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    if (confirm('Hapus banner ini?')) router.delete(route('admin.banners.destroy', id));
  };

  return (
    <AdminLayout title="Manajemen Banner">
      <div className="flex justify-end mb-5">
        <button onClick={() => { setEditBanner(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah Banner
        </button>
      </div>

      {(showForm || editBanner) && (
        <BannerForm banner={editBanner} onClose={() => { setShowForm(false); setEditBanner(null); }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {b.image && <img src={b.image} alt={b.title} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{b.title || 'Banner'}</p>
                  {b.subtitle && <p className="text-xs text-gray-500 mt-0.5">{b.subtitle}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {b.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    {b.ends_at && <span className="text-xs text-gray-400">s/d {formatTanggal(b.ends_at)}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={route('admin.banners.show', b.id)} className="text-gray-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></Link>
                  <button onClick={() => { setEditBanner(b); setShowForm(false); }} className="text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleToggle(b.id)} title={b.is_active ? 'Nonaktifkan' : 'Aktifkan'} className={b.is_active ? 'text-green-500 hover:text-yellow-500' : 'text-gray-300 hover:text-green-500'}>
                    {b.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-xl">Belum ada banner</div>}
      </div>
    </AdminLayout>
  );
}
