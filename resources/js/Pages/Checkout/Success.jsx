import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccess({ order }) {
  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-10">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Pesananmu telah kami terima. Kami akan segera memproses pesananmu.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">No. Pesanan</span>
              <span className="font-mono font-semibold text-gray-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-blue-600">{formatRupiah(order.total)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Konfirmasi pesanan akan dikirimkan ke email kamu.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={route('orders.show', order.order_number)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm"
            >
              Lihat Detail Pesanan
            </Link>
            <Link
              href={route('catalog.index')}
              className="w-full text-gray-500 hover:text-blue-600 py-2 text-sm"
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
