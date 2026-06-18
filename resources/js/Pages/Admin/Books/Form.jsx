import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      className={"w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " + (error ? 'border-red-400' : 'border-gray-200')}
      {...props}
    />
  );
}

export default function BookForm({ book, categories, authors, publishers }) {
  const isEdit = !!book;
  const [coverPreview, setCoverPreview] = useState(book?.cover_image || null);
  const coverRef = useRef();

  const { data, setData, post, put, processing, errors } = useForm({
    title: book?.title || '',
    isbn: book?.isbn || '',
    category_id: book?.category_id || '',
    publisher_id: book?.publisher_id || '',
    author_ids: book?.authors?.map(a => a.id) || [],
    synopsis: book?.synopsis || '',
    book_type: book?.book_type || 'physical',
    language: book?.language || 'Indonesia',
    pages: book?.pages || '',
    weight: book?.weight || '',
    price: book?.price || '',
    digital_price: book?.digital_price || '',
    discount_percent: book?.discount_percent || 0,
    discount_until: book?.discount_until || '',
    stock: book?.stock || 0,
    is_featured: book?.is_featured || false,
    is_active: book?.is_active ?? true,
    meta_title: book?.meta_title || '',
    meta_description: book?.meta_description || '',
    cover_image: null,
    digital_file: null,
  });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData('cover_image', file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleAuthor = (id) => {
    const ids = data.author_ids.includes(id)
      ? data.author_ids.filter(a => a !== id)
      : [...data.author_ids, id];
    setData('author_ids', ids);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.books.update', book.id), { forceFormData: true });
    } else {
      post(route('admin.books.store'), { forceFormData: true });
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Buku' : 'Tambah Buku'}>
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Cover + Meta */}
          <div className="space-y-4">
            {/* Cover */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Cover Buku</h2>
              <div
                onClick={() => coverRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Klik untuk upload cover</p>
                  </>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              {errors.cover_image && <p className="text-red-500 text-xs mt-1">{errors.cover_image}</p>}
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-800">Visibilitas</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Aktif (tampil di katalog)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Tampilkan di Homepage</span>
              </label>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-800">SEO</h2>
              <Field label="Meta Title" error={errors.meta_title}>
                <Input value={data.meta_title} onChange={e => setData('meta_title', e.target.value)} placeholder={data.title} />
              </Field>
              <Field label="Meta Description" error={errors.meta_description}>
                <textarea
                  value={data.meta_description}
                  onChange={e => setData('meta_description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
            </div>
          </div>

          {/* Right: Main Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Informasi Buku</h2>
              <Field label="Judul Buku *" error={errors.title}>
                <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ISBN" error={errors.isbn}>
                  <Input value={data.isbn} onChange={e => setData('isbn', e.target.value)} placeholder="978-xxx-xxx-xxx-x" />
                </Field>
                <Field label="Bahasa" error={errors.language}>
                  <select value={data.language} onChange={e => setData('language', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Indonesia</option>
                    <option>English</option>
                    <option>Lainnya</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kategori *" error={errors.category_id}>
                  <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Penerbit" error={errors.publisher_id}>
                  <select value={data.publisher_id} onChange={e => setData('publisher_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih Penerbit</option>
                    {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Penulis" error={errors.author_ids}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {authors.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAuthor(a.id)}
                      className={"px-3 py-1 rounded-full text-xs font-medium transition " + (data.author_ids.includes(a.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Sinopsis" error={errors.synopsis}>
                <textarea
                  value={data.synopsis}
                  onChange={e => setData('synopsis', e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi lengkap buku..."
                />
              </Field>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Tipe & Harga</h2>
              <Field label="Tipe Buku" error={errors.book_type}>
                <select value={data.book_type} onChange={e => setData('book_type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="physical">Fisik</option>
                  <option value="digital">Digital</option>
                  <option value="both">Fisik & Digital</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Harga Fisik (Rp) *" error={errors.price}>
                  <Input type="number" value={data.price} onChange={e => setData('price', e.target.value)} min={0} />
                </Field>
                {(data.book_type === 'digital' || data.book_type === 'both') && (
                  <Field label="Harga Digital (Rp)" error={errors.digital_price}>
                    <Input type="number" value={data.digital_price} onChange={e => setData('digital_price', e.target.value)} min={0} />
                  </Field>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Diskon (%)" error={errors.discount_percent}>
                  <Input type="number" value={data.discount_percent} onChange={e => setData('discount_percent', e.target.value)} min={0} max={100} />
                </Field>
                <Field label="Berlaku s/d" error={errors.discount_until}>
                  <Input type="date" value={data.discount_until} onChange={e => setData('discount_until', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {data.book_type !== 'digital' && (
                  <Field label="Stok" error={errors.stock}>
                    <Input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} min={0} />
                  </Field>
                )}
                <Field label="Halaman" error={errors.pages}>
                  <Input type="number" value={data.pages} onChange={e => setData('pages', e.target.value)} min={1} />
                </Field>
                {data.book_type !== 'digital' && (
                  <Field label="Berat (gram)" error={errors.weight}>
                    <Input type="number" value={data.weight} onChange={e => setData('weight', e.target.value)} min={0} />
                  </Field>
                )}
              </div>
              {(data.book_type === 'digital' || data.book_type === 'both') && (
                <Field label="File Digital (PDF)" error={errors.digital_file}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setData('digital_file', e.target.files[0])}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </Field>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <a href={route('admin.books.index')} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
                Batal
              </a>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold"
              >
                {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Buku')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
