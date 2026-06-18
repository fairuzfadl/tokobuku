import MainLayout from '@/Layouts/MainLayout';
import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { MapPin, Plus, Trash2, SquarePen } from 'lucide-react';
import { useState } from 'react';

const PROVINCES = [
  'Aceh','Bali','Banten','Bengkulu','DI Yogyakarta','DKI Jakarta','Gorontalo',
  'Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan',
  'Kalimantan Tengah','Kalimantan Timur','Kalimantan Utara','Kepulauan Bangka Belitung',
  'Kepulauan Riau','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur',
  'Papua','Papua Barat','Riau','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tengah',
  'Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan','Sumatera Utara',
];

function AddressFormFields({ data, setData, errors, isEdit = false }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
          <select
            value={data.label}
            onChange={e => setData('label', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Rumah</option>
            <option>Kantor</option>
            <option>Lainnya</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nama Penerima</label>
          <input
            value={data.recipient_name}
            onChange={e => setData('recipient_name', e.target.value)}
            className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.recipient_name ? 'border-red-400' : 'border-gray-200')}
          />
          {errors.recipient_name && <p className="text-red-500 text-xs mt-1">{errors.recipient_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Telepon</label>
        <input
          type="tel"
          inputMode="numeric"
          value={data.phone}
          onChange={e => setData('phone', e.target.value.replace(/\D/g, ''))}
          className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.phone ? 'border-red-400' : 'border-gray-200')}
          placeholder="08xxxxxxxxxx"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Provinsi</label>
        <select
          value={data.province}
          onChange={e => setData('province', e.target.value)}
          className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.province ? 'border-red-400' : 'border-gray-200')}
        >
          <option value="">Pilih Provinsi</option>
          {PROVINCES.map(p => <option key={p}>{p}</option>)}
        </select>
        {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
          <input
            value={data.city}
            onChange={e => setData('city', e.target.value)}
            className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.city ? 'border-red-400' : 'border-gray-200')}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Kode Pos</label>
          <input
            inputMode="numeric"
            value={data.postal_code}
            onChange={e => setData('postal_code', e.target.value.replace(/\D/g, ''))}
            className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.postal_code ? 'border-red-400' : 'border-gray-200')}
            placeholder="12345"
            maxLength={5}
          />
          {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Lengkap</label>
        <textarea
          value={data.full_address}
          onChange={e => setData('full_address', e.target.value)}
          rows={3}
          className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (errors.full_address ? 'border-red-400' : 'border-gray-200')}
          placeholder="Nama jalan, nomor, RT/RW..."
        />
        {errors.full_address && <p className="text-red-500 text-xs mt-1">{errors.full_address}</p>}
      </div>

      {!isEdit && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.is_default}
            onChange={e => setData('is_default', e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">Jadikan alamat utama</span>
        </label>
      )}
    </div>
  );
}

function AddressForm({ onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    label: 'Rumah',
    recipient_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    village: '',
    postal_code: '',
    full_address: '',
    is_default: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('profile.addresses.store'), {
      onSuccess: () => { reset(); onClose(); },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <h2 className="font-bold text-gray-900 mb-4">Tambah Alamat Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AddressFormFields data={data} setData={setData} errors={errors} />
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold text-sm"
          >
            {processing ? 'Menyimpan...' : 'Simpan Alamat'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function EditForm({ address, onClose }) {
  const { data, setData, put, processing, errors } = useForm({
    label: address.label,
    recipient_name: address.recipient_name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district ?? '',
    village: address.village ?? '',
    postal_code: address.postal_code,
    full_address: address.full_address,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('profile.addresses.update', address.id), {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-4">
      <h2 className="font-bold text-gray-900 mb-4">Edit Alamat</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AddressFormFields data={data} setData={setData} errors={errors} isEdit />
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold text-sm"
          >
            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressCard({ address, onDelete, onDefault, onEdit }) {
  return (
    <div className={"bg-white rounded-2xl shadow-sm p-5 " + (address.is_default ? 'ring-2 ring-blue-500' : '')}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{address.label}</span>
          {address.is_default && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Utama</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!address.is_default && (
            <button onClick={() => onDefault(address.id)} className="text-xs text-blue-600 hover:underline">
              Jadikan Utama
            </button>
          )}
          <button onClick={() => onEdit(address)} className="text-gray-400 hover:text-blue-600" title="Edit">
            <SquarePen className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(address.id)} className="text-gray-400 hover:text-red-600" title="Hapus">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="font-medium text-sm text-gray-800">{address.recipient_name}</p>
      <p className="text-sm text-gray-500">{address.phone}</p>
      <p className="text-sm text-gray-500 mt-1">{address.full_address}, {address.city}, {address.province} {address.postal_code}</p>
    </div>
  );
}

export default function AddressesIndex({ addresses }) {
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  const handleDelete = (id) => {
    if (confirm('Hapus alamat ini?')) {
      router.delete(route('profile.addresses.destroy', id));
    }
  };

  const handleDefault = (id) => {
    router.patch(route('profile.addresses.default', id));
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditAddress(null);
    setShowForm(true);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Alamat Saya</h1>
          {!showForm && !editAddress && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Tambah Alamat
            </button>
          )}
        </div>

        {showForm && <AddressForm onClose={() => setShowForm(false)} />}
        {editAddress && <EditForm address={editAddress} onClose={() => setEditAddress(null)} />}

        {addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <MapPin className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
            <button onClick={handleAddNew} className="text-blue-600 text-sm hover:underline">
              Tambah alamat pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                address={addr}
                onDelete={handleDelete}
                onDefault={handleDefault}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
