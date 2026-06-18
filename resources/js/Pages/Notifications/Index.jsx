import MainLayout from '@/Layouts/MainLayout';
import { router } from '@inertiajs/react';
import { Bell, Package, DollarSign, Truck, CheckCircle } from 'lucide-react';
import { formatTanggalWaktu } from '@/utils/date';

const ICON_MAP = {
  order_placed: Package,
  order_paid: DollarSign,
  order_shipped: Truck,
  order_completed: CheckCircle,
};

function NotificationItem({ notif }) {
  const data = notif.data || {};
  const Icon = ICON_MAP[data.type] || Bell;
  const isUnread = !notif.read_at;

  const handleClick = () => {
    if (isUnread) {
      router.patch(route('notifications.read', notif.id), {}, { preserveScroll: true });
    }
    if (data.url) router.visit(data.url);
  };

  return (
    <div
      onClick={handleClick}
      className={"flex gap-4 p-4 cursor-pointer rounded-xl transition " + (isUnread ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50')}
    >
      <div className={"rounded-full p-2.5 flex-shrink-0 " + (isUnread ? 'bg-blue-600' : 'bg-gray-200')}>
        <Icon className={"h-5 w-5 " + (isUnread ? 'text-white' : 'text-gray-500')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={"text-sm " + (isUnread ? 'font-semibold text-gray-900' : 'text-gray-700')}>
          {data.message || 'Notifikasi baru'}
        </p>
        {data.order_number && (
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{data.order_number}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatTanggalWaktu(notif.created_at)}</p>
      </div>
      {isUnread && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />}
    </div>
  );
}

export default function NotificationsIndex({ notifications }) {
  const unreadCount = notifications.data?.filter(n => !n.read_at).length || 0;

  const handleReadAll = () => {
    router.patch(route('notifications.readAll'), {}, { preserveScroll: true });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          {unreadCount > 0 && (
            <button onClick={handleReadAll} className="text-sm text-blue-600 hover:underline">
              Tandai semua dibaca
            </button>
          )}
        </div>

        {notifications.data?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Bell className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {notifications.data.map(notif => (
              <NotificationItem key={notif.id} notif={notif} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {notifications.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {notifications.links?.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                className={"px-3 py-1.5 rounded-lg text-sm " + (link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40')}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
