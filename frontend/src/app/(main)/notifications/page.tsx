'use client';

import { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead } from '@/app/services/notifications';
import { NotificationItem } from '@/app/types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      // Update local state to reflect change immediately
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif)));
    } catch (err) {
      console.error('Error al marcar notificación como leída', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-600 shadow-sm">{error}</div>;
  }

  return (
    <>
      <section className="mb-2">
        <h1 className="text-3xl font-semibold text-slate-900">Notificaciones</h1>
        <p className="mt-2 pb-6 text-slate-500">Mantente al tanto de tus análisis y alertas.</p>
        <hr className='border border-slate-400'/>
      </section>
      <section className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            No tienes notificaciones en este momento.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-3xl border p-6 transition-all ${
                notif.is_read
                  ? 'border-white/70 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'
                  : 'border-blue-200 bg-blue-50/50 shadow-md ring-1 ring-blue-400'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3
                    className={`text-lg ${notif.is_read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}
                  >
                    {notif.title}
                  </h3>
                  <p className="mt-1 text-slate-600">{notif.message}</p>
                  <p className="mt-4 text-xs text-slate-400">{formatDate(notif.created_at)}</p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="mt-4 sm:mt-0 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}

