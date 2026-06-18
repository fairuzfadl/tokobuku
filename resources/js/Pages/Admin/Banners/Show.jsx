import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Image, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0 w-32">{label}</span>
      <div className="text-sm text-gray-800 text-right">{children}</div>
    </div>
  );
}

export default function AdminBannerShow({ banner }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <AdminLayout title={`Banner: ${banner.title || 'Tanpa Judul'}`}>
      <div className="mb-5">
        <Link href={route('admin.banners.index')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Banner
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800">Preview Banner</h3>
          </div>
          {banner.image ? (
            <div className="relative">
              <img src={banner.image} alt={banner.title} className="w-full object-cover max-h-64" />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  {banner.title && <p className="text-white font-bold text-lg drop-shadow">{banner.title}</p>}
                  {banner.subtitle && <p className="text-white/80 text-sm drop-shadow">{banner.subtitle}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
              <Image className="h-10 w-10 mb-2 text-gray-200" />
              <p className="text-sm">Belum ada gambar</p>
            </div>
          )}
        </div>

        {/* Detail Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Banner</h3>
          <div>
            <InfoRow label="Judul">
              <span className="font-medium">{banner.title || '—'}</span>
            </InfoRow>
            <InfoRow label="Subjudul">
              {banner.subtitle || '—'}
            </InfoRow>
            <InfoRow label="Link">
              {banner.link
                ? <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    {banner.link} <ExternalLink className="h-3 w-3" />
                  </a>
                : '—'}
            </InfoRow>
            <InfoRow label="Urutan Tampil">
              <span className="font-mono">{banner.sort_order ?? 0}</span>
            </InfoRow>
            <InfoRow label="Status">
              {banner.is_active
                ? <span className="inline-flex items-center gap-1.5 text-green-700 font-medium"><ToggleRight className="h-4 w-4 text-green-600" /> Aktif</span>
                : <span className="inline-flex items-center gap-1.5 text-gray-500"><ToggleLeft className="h-4 w-4" /> Nonaktif</span>}
            </InfoRow>
            <InfoRow label="Mulai Tayang">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {formatDate(banner.starts_at)}
              </span>
            </InfoRow>
            <InfoRow label="Berakhir">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {formatDate(banner.ends_at)}
              </span>
            </InfoRow>
            <InfoRow label="Dibuat">
              {formatDate(banner.created_at)}
            </InfoRow>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
