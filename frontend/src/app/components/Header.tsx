'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getInitials } from '@/app/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { getNotifications } from '@/app/services/notifications';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getNotifications()
        .then((data) => {
          const hasUnread = data.notifications.some((notif) => !notif.is_read);
          setHasUnreadNotifications(hasUnread);
        })
        .catch((error) => console.error('Error fetching notifications:', error));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user ? getInitials(user.fullname || user.username) : 'U';
  const displayName = user ? user.username || user.fullname : 'Usuario';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'analysis', label: 'Análisis', href: '/analysis' },
    { key: 'reports', label: 'Reportes', href: '/reports' },
    { key: 'planning', label: 'Planificación', href: '/planning' },
    { key: 'history', label: 'Historial', href: '/history' },
  ];

  // Map pathname to nav key
  const getActiveKey = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/analysis')) return 'analysis';
    if (pathname.startsWith('/reports')) return 'reports';
    if (pathname.startsWith('/planning')) return 'planning';
    if (pathname.startsWith('/history')) return 'history';
    return 'dashboard';
  };

  const activeKey = getActiveKey();

  const renderNotificationsIcon = () => {
    if (hasUnreadNotifications) {
      return (
        <Link href='/notifications' className="relative p-3 hover:bg-slate-100 rounded-full">
          <Image
            src={hasUnreadNotifications ? '/icons/unread_notification.svg' : '/icons/notification.svg'}
            alt="Notifications"
            height={24}
            width={24}
          />
        </Link>
      );
    }
  };

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link href="/dashboard" className="flex items-center gap-4">
        <Image src="/logo_black.svg" alt="Main logo" width={70} height={50} />
        <div>
          <h1 className="text-4xl font-semibold tracking-tight font-funnel">Animus</h1>
        </div>
      </Link>
      <nav className="flex lg:flex-nowrap items-center gap-4 font-medium text-slate-600">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`px-4 py-3 rounded-full hover:bg-gray-100 hover:border hover:border-gray-300 transition-color ${
              activeKey === item.key ? 'underline underline-offset-8 text-blue font-bold' : ''
            }`}
          >
            <p>{item.label}</p>
          </Link>
        ))}
      </nav>
      <div className="relative flex items-center gap-3">
        {/* <div className="relative flex-1 sm:min-w-65">
          <Image className="absolute top-2.5 left-3" src="/icons/search.svg" alt="Search" height={25} width={25} />
          <input
            className="h-11 w-3 xl:w-full rounded-full border border-slate-200 bg-white/80 pl-10 pr-16 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            placeholder="Buscar"
            type="search"
          />
        </div> */}
        {renderNotificationsIcon()}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-900 to-slate-500 text-xs font-semibold text-white">
              {initials}
            </span>
            {displayName}
          </button>
          <ul className={`w-fit whitespace-nowrap absolute right-0 top-14 rounded-2xl border border-slate-100 bg-white p-3 text-slate-600 shadow-xl transition-all duration-200 ${isDropdownOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}>
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <Link href="/notifications" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Notificaciones</Link>
            </li>
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <Link href="/settings" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Configuración</Link>
            </li>
            <hr className="my-2" />
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <button onClick={handleLogout}>Cerrar sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
