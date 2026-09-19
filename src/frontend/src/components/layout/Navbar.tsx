import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/client';
import { NotificationItem } from '../../types';
import { UserRole } from '../../types';
import {
  Recycle,
  PlusCircle,
  Bell,
  CheckCircle,
  MapPin,
  Flame,
  Truck,
  Cog,
  Shield,
  Layers,
  BarChart3,
  CheckCheck,
  Menu,
  X
} from 'lucide-react';

type NavigationItem = {
  label: string;
  path: string;
  icon?: React.ReactNode;
  iconClassName?: string;
};

const roleNavigation: Record<UserRole, NavigationItem[]> = {
  CITIZEN: [
    { label: 'Overview', path: '/overview' },
    { label: 'Dashboard', path: '/citizen' },
    { label: 'Recycled Materials', path: '/materials' },
    { label: 'Impact', path: '/impact' }
  ],
  BUILDER: [
    { label: 'Overview', path: '/overview' },
    { label: 'Dashboard', path: '/citizen' },
    { label: 'Recycled Materials', path: '/materials' },
    { label: 'Impact', path: '/impact' }
  ],
  COLLECTION_TEAM: [
    { label: 'Overview', path: '/overview' },
    { label: 'Collection Assignments', path: '/collection', icon: <Truck className="w-4 h-4" />, iconClassName: 'text-forest-600' },
    { label: 'City Debris', path: '/city-debris', icon: <Truck className="w-4 h-4" />, iconClassName: 'text-charcoal-600' },
    { label: 'City Debris Map', path: '/admin/map', icon: <MapPin className="w-4 h-4" />, iconClassName: 'text-terracotta-600' }
  ],
  PROCESSING_TEAM: [
    { label: 'Overview', path: '/overview' },
    { label: 'Processing Batch', path: '/processing', icon: <Cog className="w-4 h-4" />, iconClassName: 'text-forest-600' },
    { label: 'Recycled Products', path: '/materials', icon: <Layers className="w-4 h-4" />, iconClassName: 'text-terracotta-600' },
    { label: 'Ecological Impact', path: '/impact', icon: <BarChart3 className="w-4 h-4" />, iconClassName: 'text-forest-600' }
  ],
  ADMIN: [
    { label: 'Overview', path: '/overview' },
    { label: 'Command Centre', path: '/admin', icon: <Shield className="w-4 h-4" />, iconClassName: 'text-forest-700' },
    { label: 'GIS Map', path: '/admin/map', icon: <MapPin className="w-4 h-4" />, iconClassName: 'text-terracotta-600' },
    { label: 'Hotspots', path: '/admin/hotspots', icon: <Flame className="w-4 h-4" />, iconClassName: 'text-amber-600' },
    { label: 'Collection', path: '/collection', icon: <Truck className="w-4 h-4" />, iconClassName: 'text-charcoal-600' },
    { label: 'Processing', path: '/processing', icon: <Cog className="w-4 h-4" />, iconClassName: 'text-charcoal-600' },
    { label: 'Impact', path: '/impact' }
  ]
};

export const Navbar: React.FC = () => {
  const { activeRole } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [activeRole]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path || (path === '/overview' && location.pathname === '/');

  const navigationItems = roleNavigation[activeRole];

  const renderNavigationItem = (item: NavigationItem, mobile = false) => (
    <Link
      key={item.path + item.label}
      to={item.path}
      className={`${mobile ? 'px-3 py-2.5' : 'px-3 py-1.5'} rounded-lg transition flex items-center gap-1.5 ${
        isActive(item.path)
          ? 'text-forest-800 bg-forest-50 font-semibold'
          : 'text-charcoal-700 hover:text-forest-700 hover:bg-sand-100'
      }`}
    >
      {item.icon && React.cloneElement(item.icon as React.ReactElement, {
        className: `w-4 h-4 ${item.iconClassName || ''}`
      })}
      {item.label}
    </Link>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-sand-200 sticky top-[33px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/overview" className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-forest-700 to-forest-900 text-white flex items-center justify-center shadow-md shadow-forest-900/10 group-hover:scale-105 transition-transform">
                <Recycle className="w-6 h-6 text-forest-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-forest-950 font-display">
                    ReBuild
                  </span>
                  <span className="text-base sm:text-lg font-semibold tracking-tight text-terracotta-600 font-display">
                    Mysore
                  </span>
                </div>
                <p className="hidden sm:block text-[10px] text-charcoal-500 font-medium tracking-wide uppercase">
                  Circular C&D Waste Platform
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navigationItems.map((item) => renderNavigationItem(item))}
            </div>
          </div>

          {/* Right Action Icons & Report CTA */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-charcoal-700 hover:text-forest-700 hover:bg-sand-100 transition"
              aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl text-charcoal-600 hover:text-forest-700 hover:bg-sand-100 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-terracotta-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-sand-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-sand-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-forest-100 text-forest-800 text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-sand-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-charcoal-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-sand-50 transition flex items-start justify-between gap-3 ${
                            !notif.read ? 'bg-forest-50/40' : ''
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-charcoal-900 flex items-center gap-1.5">
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-forest-600 inline-block" />
                              )}
                              {notif.title}
                            </p>
                            <p className="text-xs text-charcoal-600 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-charcoal-400 block mt-1">
                              {new Date(notif.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-charcoal-400 hover:text-forest-700 p-1"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Report Waste Button */}
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold shadow-sm shadow-forest-900/20 hover:shadow transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-forest-300" />
              <span>Report Waste</span>
            </Link>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-sand-200 py-3">
            <div className="grid gap-1 text-sm font-medium">
              {navigationItems.map((item) => renderNavigationItem(item, true))}
              <Link
                to="/report"
                className="mt-2 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-forest-700 text-white font-semibold"
              >
                <PlusCircle className="w-4 h-4 text-forest-300" />
                Report Waste
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
