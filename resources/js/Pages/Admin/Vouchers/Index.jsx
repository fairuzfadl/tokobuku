import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { formatTanggal } from '@/utils/date';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

function VoucherForm({ voucher, onClose }) {
  const isEdit = !!voucher;
  const [data, setData] = useState({
    code: voucher?.code || '',
    type: voucher?.type || 'percent',
    value: voucher?.value || '',
    min_order: voucher?.min_order || 0,
    max_discount: voucher?.max_discount || '',
    max_uses: voucher?.max_uses || '',
    starts_at: voucher?.starts_at?.slice(0, 10) || '',
    expires_at: voucher?.expires_at?.slice(0, 10) || '',
    is_active: voucher?.is_active ?? true,
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    const action = isEdit
      ? router.put(route('admin.vouchers.update', voucher.id), data, { onFinish: () => setProcessing(false), onSuccess: onClose })
      : router.post(route('admin.vouchers.store'), data, { onFinish: () => setProcessing(false), onSuccess: onClose });
  };

  const field = (key, value) => setData(d => ({ ...d, [key]: value }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <h2 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Edit Voucher' : 'Tambah Voucher'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Kode Voucher *</label>
          <input value={data.code} onChange={e => field('code', e.target.value.toUpperCase())} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
          <select value={data.type} onChange={e => field('type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="percent">Persentase (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nilai *</label>
          <input type="number" value={data.value} onChange={e => field('value', e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Min. Belanja (Rp)</label>
          <input type="number" value={data.min_order} onChange={e => field('min_order', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {data.type === 'percent' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max. Diskon (Rp)</label>
            <input type="number" value={data.max_discount} onChange={e => field('max_discount', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Maks. Penggunaan</label>
          <input type="number" value={data.max_uses} onChange={e => field('max_uses', e.target.value)} placeholder="Kosong = tak terbatas" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Berlaku Mulai</label>
          <input type="date" value={data.starts_at} onChange={e => field('starts_at', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Berlaku Sampai</label>
          <input type="date" value={data.expires_at} onChange={e => field('expires_at', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <label className="col-span-2 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.is_active} onChange={e => field('is_active', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
          <span className="text-sm text-gray-700">Aktif</span>
        </label>
        <div className="col-span-2 flex gap-3">
          <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300">
            {processing ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Batal</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminVouchersIndex({ vouchers }) {
  const [showForm, setShowForm] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);

  const handleToggle = (id) => {
    router.patch(route('admin.vouchers.toggleActive', id), {}, { preserveScroll: true });
  };

  const handleDelete = (id, code) => {
    if (confirm(`Hapus voucher "${code}"?`)) {
      router.delete(route('admin.vouchers.destroy', id));
    }
  };

  return (
    <AdminLayout title="Manajemen Voucher">
      <div className="flex justify-end mb-5">
        <button onClick={() => { setEditVoucher(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah Voucher
        </button>
      </div>

      {(showForm || editVoucher) && (
        <VoucherForm voucher={editVoucher} onClose={() => { setShowForm(false); setEditVoucher(null); }} />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Kode</th>
              <th className="text-left px-5 py-3">Tipe & Nilai</th>
              <th className="text-left px-5 py-3">Min. Belanja</th>
              <th className="text-left px-5 py-3">Digunakan</th>
              <th className="text-left px-5 py-3">Masa Berlaku</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-mono font-bold text-gray-900">{v.code}</td>
                <td className="px-5 py-3">
                  {v.type === 'percent' ? `${v.value}%` : formatRupiah(v.value)}
                  {v.max_discount && <span className="text-xs text-gray-400 ml-1">(maks {formatRupiah(v.max_discount)})</span>}
                </td>
                <td className="px-5 py-3 text-gray-600">{formatRupiah(v.min_order)}</td>
                <td className="px-5 py-3 text-gray-600">{v.used_count}/{v.max_uses || '∞'}</td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {v.expires_at ? `s/d ${formatTanggal(v.expires_at)}` : 'Tidak terbatas'}
                </td>
                <td className="px-5 py-3">
                  <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {v.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditVoucher(v); setShowForm(false); }} className="text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleToggle(v.id)} title={v.is_active ? 'Nonaktifkan' : 'Aktifkan'} className={v.is_active ? 'text-green-500 hover:text-yellow-500' : 'text-gray-300 hover:text-green-500'}>
                      {v.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => handleDelete(v.id, v.code)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada voucher</div>}
      </div>
    </AdminLayout>
  );
}
