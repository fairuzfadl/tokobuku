import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Save } from 'lucide-react';

const GROUP_LABELS = {
  general:   'Umum',
  payment:   'Pembayaran',
  shipping:  'Pengiriman',
  inventory: 'Inventori',
  order:     'Pesanan',
  review:    'Ulasan',
};

const KEY_LABELS = {
  site_name:               'Nama Situs',
  site_tagline:            'Tagline Situs',
  contact_email:           'Email Kontak',
  contact_phone:           'Telepon Kontak',
  midtrans_env:            'Environment Midtrans',
  midtrans_snap_url:       'Snap URL Midtrans',
  midtrans_client_key:     'Client Key Midtrans',
  free_shipping_threshold: 'Gratis Ongkir (min. pembelian Rp)',
  flat_shipping_cost:      'Ongkos Kirim Flat (Rp)',
  low_stock_threshold:     'Notifikasi Stok Rendah (stok ≤)',
  order_expiry_hours:      'Batas Waktu Bayar (jam)',
  review_auto_approve:     'Auto-Approve Ulasan (1=ya, 0=tidak)',
};

const NUMERIC_KEYS = new Set([
  'free_shipping_threshold', 'flat_shipping_cost', 'low_stock_threshold',
  'order_expiry_hours', 'review_auto_approve',
]);

const PHONE_KEYS = new Set(['contact_phone']);

export default function AdminSettingsIndex({ settings }) {
  const [form, setForm] = useState(() => {
    const flat = {};
    Object.values(settings).forEach(group => {
      Object.values(group).forEach(s => { flat[s.key] = s.value ?? ''; });
    });
    return flat;
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    const payload = Object.entries(form).map(([key, value]) => ({ key, value }));
    router.post(route('admin.settings.update'), { settings: payload }, {
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <AdminLayout title="Pengaturan Aplikasi">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {Object.entries(settings).map(([group, items]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">{GROUP_LABELS[group] ?? group}</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.values(items).map(setting => (
                <div key={setting.key} className="grid grid-cols-5 gap-4 items-center">
                  <label className="col-span-2 text-sm text-gray-600 font-medium">
                    {KEY_LABELS[setting.key] ?? setting.key}
                  </label>
                  <input
                    type={NUMERIC_KEYS.has(setting.key) ? 'number' : 'text'}
                    inputMode={PHONE_KEYS.has(setting.key) ? 'numeric' : undefined}
                    min={NUMERIC_KEYS.has(setting.key) ? 0 : undefined}
                    value={form[setting.key] ?? ''}
                    onChange={e => setForm(f => ({
                      ...f,
                      [setting.key]: PHONE_KEYS.has(setting.key)
                        ? e.target.value.replace(/\D/g, '')
                        : e.target.value,
                    }))}
                    className="col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
