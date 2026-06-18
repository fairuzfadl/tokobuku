import MainLayout from '@/Layouts/MainLayout';
import { useForm, usePage } from '@inertiajs/react';
import { User, Lock, Camera } from 'lucide-react';
import { useState } from 'react';

function InputField({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (error ? 'border-red-400' : 'border-gray-200')}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ProfileIndex() {
  const { auth } = usePage().props;
  const user = auth.user;
  const [tab, setTab] = useState('profile');

  const profileForm = useForm({
    name: user.name || '',
    phone: user.phone || '',
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.post(route('profile.update'), { preserveScroll: true });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.post(route('profile.password'), {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    fetch(route('profile.avatar'), {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
      body: form,
    }).then(() => window.location.reload());
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>

        {/* Avatar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=80`}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('profile')}
            className={"px-4 py-2 rounded-full text-sm font-medium transition " + (tab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
          >
            <User className="h-4 w-4 inline mr-1.5" />Data Profil
          </button>
          <button
            onClick={() => setTab('password')}
            className={"px-4 py-2 rounded-full text-sm font-medium transition " + (tab === 'password' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100')}
          >
            <Lock className="h-4 w-4 inline mr-1.5" />Kata Sandi
          </button>
        </div>

        {tab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <InputField
                label="Nama Lengkap"
                value={profileForm.data.name}
                onChange={e => profileForm.setData('name', e.target.value)}
                error={profileForm.errors.name}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <InputField
                label="Nomor Telepon"
                type="tel"
                inputMode="numeric"
                value={profileForm.data.phone}
                onChange={e => profileForm.setData('phone', e.target.value.replace(/\D/g, ''))}
                error={profileForm.errors.phone}
                placeholder="08xxxxxxxxxx"
              />
              <button
                type="submit"
                disabled={profileForm.processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold text-sm transition"
              >
                {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <InputField
                label="Kata Sandi Saat Ini"
                type="password"
                value={passwordForm.data.current_password}
                onChange={e => passwordForm.setData('current_password', e.target.value)}
                error={passwordForm.errors.current_password}
              />
              <InputField
                label="Kata Sandi Baru"
                type="password"
                value={passwordForm.data.password}
                onChange={e => passwordForm.setData('password', e.target.value)}
                error={passwordForm.errors.password}
              />
              <InputField
                label="Konfirmasi Kata Sandi Baru"
                type="password"
                value={passwordForm.data.password_confirmation}
                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                error={passwordForm.errors.password_confirmation}
              />
              <button
                type="submit"
                disabled={passwordForm.processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold text-sm transition"
              >
                {passwordForm.processing ? 'Menyimpan...' : 'Ubah Kata Sandi'}
              </button>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
