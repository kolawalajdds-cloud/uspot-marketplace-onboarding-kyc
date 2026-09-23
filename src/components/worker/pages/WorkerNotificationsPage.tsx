import React, { useState } from 'react';
import {
  Bell,
  Settings,
  Search,
  Sliders,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface WorkerNotificationsPageProps {
  worker: UserProfile;
  onNavigate?: (page: string, params?: any) => void;
}

interface NotificationRow {
  id: string;
  date: string;
  time: string;
  title: string;
  ref?: string;
  read: boolean;
}

export const WorkerNotificationsPage: React.FC<WorkerNotificationsPageProps> = ({
  worker,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Initial notifications matching Image 5
  const [notifications, setNotifications] = useState<NotificationRow[]>([
    {
      id: '1',
      date: 'Jun 16, 2026',
      time: '11:00 AM',
      title: 'New job assigned: Plumbing at FixIt Co. on Jun 17 @ 10:00 AM',
      ref: 'Ref: #JOB-4921',
      read: false,
    },
    {
      id: '2',
      date: 'Jun 15, 2026',
      time: '4:30 PM',
      title: 'Payment of $50.00 received for job #REF-123',
      read: true,
    },
    {
      id: '3',
      date: 'Jun 14, 2026',
      time: '9:15 AM',
      title: 'Your payout request #PR-001 has been approved',
      read: true,
    },
    {
      id: '4',
      date: 'Jun 13, 2026',
      time: '2:00 PM',
      title: 'Customer has arrived for job #REF-120',
      ref: 'Status Update',
      read: false,
    },
    {
      id: '5',
      date: 'Jun 12, 2026',
      time: '10:00 AM',
      title: 'Your License has been verified',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.ref && n.ref.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR & PAGE HEADER (Exact match to Image 5)                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            You have {notifications.length} notifications, {unreadCount} unread.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search notifications bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('/worker/security')}
              className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-gray-900">
                {worker.name || 'John Cooper'}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                WORKER PORTAL
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
              {worker.avatar ? (
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                'JC'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NOTIFICATIONS TABLE (Exact match to Image 5)                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6 w-36 sm:w-44">DATE &amp; TIME</th>
                <th className="py-4 px-6">MESSAGE</th>
                <th className="py-4 px-6 text-right w-36">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-400 text-xs">
                    No notifications found.
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      !notif.read ? 'bg-white' : 'bg-white'
                    }`}
                  >
                    {/* Date & Time */}
                    <td className="py-4 px-6 whitespace-nowrap align-top">
                      <div className={`font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notif.date}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {notif.time}
                      </div>
                    </td>

                    {/* Message with unread dot */}
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-start gap-2.5">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-black shrink-0 mt-1.5" />
                        )}
                        <div>
                          <p
                            className={`text-xs leading-relaxed ${
                              !notif.read
                                ? 'font-bold text-gray-900'
                                : 'font-normal text-gray-600'
                            }`}
                          >
                            {notif.title}
                          </p>
                          {notif.ref && (
                            <div className="text-[11px] text-gray-400 mt-0.5 font-medium">
                              {notif.ref}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap align-top">
                      {!notif.read ? (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="px-3.5 py-1.5 rounded-md bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      ) : (
                        <span className="text-gray-400 font-medium text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Showing <strong className="text-gray-900">1-{Math.min(5, filteredNotifications.length)}</strong> of 12 notifications
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
            >
              &lt;
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-black text-white font-bold flex items-center justify-center text-xs"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black cursor-pointer text-xs"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black cursor-pointer text-xs"
            >
              3
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM 2 CARDS: PREFERENCE CENTER & SUPPORT DESK                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preference Center */}
        <div
          onClick={() => alert('Notification preference settings modal')}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-gray-900">
              Preference Center
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage push and email alerts.
            </p>
          </div>
        </div>

        {/* Support Desk */}
        <div
          onClick={() => onNavigate?.('/worker/tickets')}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-gray-900">
              Support Desk
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Need help with an alert? Talk to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
