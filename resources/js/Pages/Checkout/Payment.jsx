import MainLayout from '@/Layouts/MainLayout';
import { usePage, router } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { useEffect } from 'react';

export default function CheckoutPayment({ order, snap_token }) {
  const { settings } = usePage().props;

  useEffect(() => {
    // Load Midtrans Snap.js
    const script = document.createElement('script');
    script.src = settings?.midtrans_snap_url || 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', settings?.midtrans_client_key || '');
    const checkAndRedirect = async (redirectTo) => {
      try {
        await fetch(route('checkout.checkStatus', order.order_number), {
          method: 'POST',
          headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
        });
      } catch (_) {}
      router.visit(redirectTo);
    };

    script.onload = () => {
      window.snap.pay(snap_token, {
        onSuccess: () => {
          checkAndRedirect(route('checkout.success', order.order_number));
        },
        onPending: () => {
          checkAndRedirect(route('orders.show', order.order_number) + '?paid=pending');
        },
        onError: () => {
          router.visit(route('orders.show', order.order_number) + '?paid=error');
        },
        onClose: () => {
          router.visit(route('orders.show', order.order_number));
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [snap_token]);

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Menunggu Pembayaran</h2>
          <p className="text-gray-500 text-sm mb-4">
            Jendela pembayaran Midtrans sedang terbuka. Selesaikan pembayaranmu.
          </p>
          <p className="text-lg font-bold text-blue-600">{formatRupiah(order.total)}</p>
          <p className="text-xs text-gray-400 mt-1">No. Pesanan: {order.order_number}</p>
        </div>
      </div>
    </MainLayout>
  );
}
