import React, { useState, useRef, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import {
  Bell,
  Check,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Building2,
  User,
  Search,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  LogIn,
  Users,
  Shield,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    loginAsUser,
    logout,
    setAuthModalOpen,
    state,
    resetDemoData,
    unreadNotificationCount,
    allNotifications,
    selectBusinessForVendor,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setVendorView,
  } = useDemo();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: typeof allNotifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.businessId) {
      selectBusinessForVendor(
        notif.businessId,
        notif.actionRequired === 'edit_kyc' ? 'Verification' : 'Core Details'
      );
      setNotificationsOpen(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-indigo-900 text-indigo-200 border-indigo-700';
      case 'business':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'customer':
        return 'bg-emerald-900 text-emerald-200 border-emerald-700';
      case 'specialist':
        return 'bg-amber-900 text-amber-200 border-amber-700';
      default:
        return 'bg-slate-800 text-slate-200 border-slate-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
      case 'business':
        return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'customer':
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
      case 'specialist':
        return <Search className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            onClick={() => {
              if (currentUser?.role === 'business') {
                setVendorView('list');
              }
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:bg-indigo-700 transition-colors">
              UP
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-800 uppercase">
                uspot
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider border border-slate-200">
                Marketplace
              </span>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Multi-Role Authentication & KYC
          </span>
        </div>

        {/* Center: User Account / Role Switcher (Replaces the old 2 tabs) */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            <button
              id="user-role-switcher-dropdown-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all cursor-pointer focus:outline-hidden group"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {currentUser.avatarInitials}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>{currentUser.fullName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${getRoleBadgeStyle(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.roleLabel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">
                  {currentUser.email}
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform ${
                  userDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <button
              id="login-trigger-btn"
              onClick={() => {
                const el = document.getElementById('login-view-container');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* User Selector Dropdown Menu */}
          {userDropdownOpen && (
            <div
              id="user-selector-dropdown-menu"
              className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch Seeded User Role</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">4 Demo Users</span>
              </div>

              {/* Seeded Users List */}
              <div className="p-1.5 space-y-1">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      id={`switch-to-user-${u.role}`}
                      onClick={() => {
                        loginAsUser(u.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs truncate">{u.fullName}</span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                isCurrent
                                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.roleLabel}
                            </span>
                          </div>
                          <div
                            className={`text-[11px] font-mono truncate ${
                              isCurrent ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {u.email}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      ) : (
                        <div className="shrink-0 ml-2">{getRoleIcon(u.role)}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Custom Sign In...</span>
                </button>

                <button
                  id="navbar-signout-btn"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right side controls: Reset Demo Data + Notification Bell */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset Demo Data Button */}
          <div className="relative">
            <button
              id="reset-demo-data-btn"
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 uppercase tracking-widest px-2.5 sm:px-3 py-1.5 border border-slate-200 hover:border-indigo-200 rounded-md transition-colors cursor-pointer focus:outline-hidden"
              title="Reset Demo Data"
            >
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                <span className="hidden sm:inline">Reset Demo</span>
              </span>
            </button>

            {/* Reset confirmation popover */}
            {showResetConfirm && (
              <div
                id="reset-demo-confirm-popover"
                className="absolute right-0 mt-2 w-72 p-4 bg-white rounded-xl border border-slate-200 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="font-bold text-xs text-slate-900 mb-1">
                  Reset Demo State & Users?
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-normal">
                  Restores default seeded accounts (Superadmin, Business, Customer, Specalist) and initial sample businesses.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-reset-demo-btn"
                    onClick={() => {
                      resetDemoData();
                      setShowResetConfirm(false);
                    }}
                    className="px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold shadow-xs cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Center */}
          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                id="vendor-notifications-bell-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                {unreadNotificationCount > 0 && (
                  <span
                    id="unread-notifications-count-badge"
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold"
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {allNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      allNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                            !notif.read ? 'bg-indigo-50/40' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {notif.type === 'success' && (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {notif.type === 'warning' && (
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {notif.type === 'info' && (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                  <Info className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                {notif.message}
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[11px] text-slate-400">
                                  {notif.timestamp}
                                </span>
                                {notif.businessId && (
                                  <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-0.5 hover:underline">
                                    View business <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
