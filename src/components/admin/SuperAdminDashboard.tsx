import React, { useState, useEffect, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminAssetsTab, BusinessAssetsSubTab } from './tabs/AdminAssetsTab';
import { AdminBusinessManagementTab } from './tabs/AdminBusinessManagementTab';
import { AdminConfigurationTab } from './tabs/AdminConfigurationTab';
import { AdminPaymentTab } from './tabs/AdminPaymentTab';
import {
  LayoutDashboard,
  Users,
  Layers,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Bell,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Activity,
  FolderTree,
  Wrench,
  UserCheck,
  Briefcase,
  X,
  ExternalLink,
  RefreshCw,
  Check,
  User,
  Shield,
  FileCheck2,
  CreditCard,
} from 'lucide-react';

export type SuperAdminNavTab =
  | 'dashboard'
  | 'users-customers'
  | 'users-partners'
  | 'users-staff'
  | 'assets-onboarding'
  | 'assets-organizations'
  | 'assets-industries'
  | 'assets-categories'
  | 'assets-services'
  | 'assets-cat-requests'
  | 'management'
  | 'payment'
  | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const { state, currentUser, users, loginAsUser, logout } = useDemo();

  // Navigation State - default to 'assets-categories' to immediately match user screenshot!
  const [activeNav, setActiveNav] = useState<SuperAdminNavTab>('assets-categories');

  // Collapsible Accordion Sections
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [isAssetsOpen, setIsAssetsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Topbar and Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!isProfileMenuOpen && !isNotificationsOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isProfileMenuOpen, isNotificationsOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock Notifications for Super Admin
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New KYC Submission',
      desc: 'Urban Roast Hospitality submitted documentation for review.',
      time: '12m ago',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Category Request Approved',
      desc: 'Wellness Spa category request published to live catalog.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'New Business Partner Onboarded',
      desc: 'Elite Logistics activated their business workspace account.',
      time: '3h ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Switcher Helper for Overview Tab's callback
  const handleOverviewNavigate = (tabKey: 'dashboard' | 'users' | 'assets' | 'management' | 'config') => {
    if (tabKey === 'dashboard') setActiveNav('dashboard');
    else if (tabKey === 'users') setActiveNav('users-customers');
    else if (tabKey === 'assets') setActiveNav('assets-categories');
    else if (tabKey === 'management') setActiveNav('management');
    else if (tabKey === 'config') setActiveNav('settings');
  };

  // Resolve SubTabs for child tabs
  const getCurrentUserSubTab = (): 'customers' | 'partners' | 'staff' => {
    if (activeNav === 'users-partners') return 'partners';
    if (activeNav === 'users-staff') return 'staff';
    return 'customers';
  };

  const getCurrentAssetSubTab = (): BusinessAssetsSubTab => {
    if (activeNav === 'assets-onboarding') return 'onboarding';
    if (activeNav === 'assets-organizations') return 'organizations';
    if (activeNav === 'assets-industries') return 'industries';
    if (activeNav === 'assets-categories') return 'categories';
    if (activeNav === 'assets-services') return 'services';
    if (activeNav === 'assets-cat-requests') return 'service-categories';
    return 'categories';
  };

  return (
    <div id="superadmin-layout-container" className="h-full w-full bg-[#F8FAFC] flex text-slate-900 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Charcoal Theme matching screenshot)                 */}
      {/* ========================================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#0A0E17] text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-200 border-r border-slate-800/80 z-30 select-none h-full overflow-hidden`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0 overscroll-contain scrollbar-none">
          {/* Brand Logo Header matching screenshot */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                U
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div className="flex items-center">
                    <span className="text-white font-extrabold text-base tracking-tight font-sans">Ur</span>
                    <span className="text-blue-500 font-extrabold text-base tracking-tight font-sans">SPOT</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-0.5">
                    SUPER ADMIN
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {/* 1. Dashboard */}
            <button
              id="sidebar-admin-dashboard"
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeNav === 'dashboard' ? 'text-blue-600' : ''}`} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            {/* 2. Users (Collapsible Accordion Group) */}
            <div>
              <button
                id="sidebar-admin-users-toggle"
                onClick={() => {
                  setIsUsersOpen(!isUsersOpen);
                  if (!activeNav.startsWith('users-')) {
                    setActiveNav('users-customers');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeNav.startsWith('users-')
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Users</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isUsersOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-items: Customers, Partners, Staff */}
              {isUsersOpen && !isSidebarCollapsed && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-customers"
                    onClick={() => setActiveNav('users-customers')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'users-customers'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'users-customers' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Customers</span>
                  </button>

                  <button
                    id="sidebar-subtab-partners"
                    onClick={() => setActiveNav('users-partners')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'users-partners'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'users-partners' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Partners</span>
                  </button>

                  <button
                    id="sidebar-subtab-staff"
                    onClick={() => setActiveNav('users-staff')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'users-staff'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'users-staff' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Staff</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Business Assets (Collapsible Accordion Group - matching screenshot) */}
            <div>
              <button
                id="sidebar-admin-assets-toggle"
                onClick={() => {
                  setIsAssetsOpen(!isAssetsOpen);
                  if (!activeNav.startsWith('assets-')) {
                    setActiveNav('assets-categories');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeNav.startsWith('assets-')
                    ? 'text-white font-bold bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Business Assets</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isAssetsOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-items matching screenshot: Onboarding, Organizations, Industries, Categories, Services, Cat. Requests */}
              {isAssetsOpen && !isSidebarCollapsed && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  <button
                    id="sidebar-subtab-onboarding"
                    onClick={() => setActiveNav('assets-onboarding')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-onboarding'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-onboarding' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Business Onboarding</span>
                  </button>

                  <button
                    id="sidebar-subtab-organizations"
                    onClick={() => setActiveNav('assets-organizations')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-organizations'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-organizations' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Organizations</span>
                  </button>

                  <button
                    id="sidebar-subtab-industries"
                    onClick={() => setActiveNav('assets-industries')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-industries'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-industries' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Industries</span>
                  </button>

                  {/* Categories - Active item in screenshot */}
                  <button
                    id="sidebar-subtab-categories"
                    onClick={() => setActiveNav('assets-categories')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-categories'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-categories' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Categories</span>
                  </button>

                  <button
                    id="sidebar-subtab-services"
                    onClick={() => setActiveNav('assets-services')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-services'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-services' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Services</span>
                  </button>

                  <button
                    id="sidebar-subtab-cat-requests"
                    onClick={() => setActiveNav('assets-cat-requests')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      activeNav === 'assets-cat-requests'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeNav === 'assets-cat-requests' ? 'bg-blue-600' : 'bg-slate-500'
                      }`}
                    />
                    <span>Cat. Requests</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Business Management / KYC Queue (Accessible also via link or management nav) */}
            <button
              id="sidebar-admin-management"
              onClick={() => setActiveNav('management')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'management'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 shrink-0 ${activeNav === 'management' ? 'text-blue-600' : ''}`} />
                {!isSidebarCollapsed && <span>KYC & Businesses</span>}
              </div>
              {!isSidebarCollapsed && (() => {
                const pendingCount = state.businesses.filter(
                  (b) => b.status === 'Pending KYC Review' || b.verification?.kycSubmitted
                ).length;
                const totalUnapproved = state.businesses.filter(
                  (b) => b.status !== 'KYC Approved' && b.status !== 'Live'
                ).length;
                const countToDisplay = pendingCount > 0 ? pendingCount : totalUnapproved;
                return countToDisplay > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 font-mono">
                    {countToDisplay}
                  </span>
                ) : null;
              })()}
            </button>

            {/* 5. Payment */}
            <button
              id="sidebar-admin-payment"
              onClick={() => setActiveNav('payment')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'payment'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
              title={isSidebarCollapsed ? 'Payment' : undefined}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`w-4 h-4 shrink-0 ${activeNav === 'payment' ? 'text-blue-600' : ''}`} />
                {!isSidebarCollapsed && <span>Payment</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeNav === 'payment'
                    ? 'bg-slate-100 text-slate-700 font-bold'
                    : 'text-slate-500 bg-slate-800/80 border border-slate-700/50'
                }`}>
                  %
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer matching screenshot: System Status, Settings, Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1.5">
          {/* System Status: Online (as shown in screenshot) */}
          {!isSidebarCollapsed ? (
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">System Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-emerald-400">Online</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto" title="System Status: Online">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          )}

        </div>

        {/* Bottom User Quick Action & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 shrink-0 bg-[#0A0E17]">
          {/* Settings */}
          <button
            id="sidebar-admin-settings"
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
              activeNav === 'settings'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>

          {/* Logout */}
          <button
            id="sidebar-admin-logout"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA WITH TOPBAR (Matching screenshot)                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overscroll-contain">
        {/* Top Header Bar matching screenshot */}
        <header className={`bg-white border-b border-slate-200/90 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 ${isProfileMenuOpen || isNotificationsOpen ? 'z-50' : 'z-20'} shadow-2xs`}>
          {/* Left: Brand / Title and Search */}
          <div className="flex items-center gap-4 flex-1">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight whitespace-nowrap">
              URSPOT Admin
            </span>

            {/* Search system resources bar (matching screenshot) */}
            <div className="relative max-w-sm w-full hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search system resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Right: Quick Links, Notifications, Profile Badge, Logout (matching screenshot) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Links: Overview, Logs, Help */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 mr-2">
              <button
                onClick={() => setActiveNav('dashboard')}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  activeNav === 'dashboard' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Logs
              </button>
              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Help
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                id="admin-topbar-bell-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsNotificationsOpen(false)}
                    onPointerDown={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">System Notifications</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                          {unreadCount} new
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotifsRead}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            n.unread ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50/60 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-1">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Admin User Profile Badge (matching screenshot) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="admin-topbar-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  S
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Admin User</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Administrator</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileMenuOpen(false)}
                    onPointerDown={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 mb-2">
                      <p className="text-xs font-bold text-slate-900">{currentUser?.fullName || 'Super Administrator'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'admin@urspot.com'}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60">
                        Super Admin Access
                      </span>
                    </div>

                    {/* Fast Demo Role Switcher */}
                    <div className="py-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">
                        Switch Active Role
                      </p>
                      {users
                        .filter((u) => u.id !== currentUser?.id)
                        .slice(0, 4)
                        .map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              loginAsUser(user.id);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                          >
                            <span className="truncate">{user.fullName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                              {user.role}
                            </span>
                          </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 pt-2 mt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Standalone Logout Icon Button (matching screenshot) */}
            <button
              onClick={logout}
              className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Display Area */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Action callout banner if any business is pending review/unapproved and activeNav is not management */}
          {activeNav !== 'management' && (() => {
            const pendingBizs = state.businesses.filter(
              (b) => b.status === 'Pending KYC Review' || b.verification?.kycSubmitted
            );
            const unapprovedBizs = state.businesses.filter(
              (b) => b.status !== 'KYC Approved' && b.status !== 'Live'
            );
            const targetBizs = pendingBizs.length > 0 ? pendingBizs : unapprovedBizs;
            if (targetBizs.length === 0) return null;
            const firstName = targetBizs[0].coreDetails?.businessName || 'New Business';
            return (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>KYC Verification Queue</span>
                      <span className="px-2 py-0.2 bg-amber-200/80 text-amber-900 rounded-md font-mono text-[10px]">
                        {targetBizs.length} waiting
                      </span>
                    </h4>
                    <p className="text-[11px] text-amber-800 font-normal mt-0.5">
                      Business awaiting review: <span className="font-bold underline">"{firstName}"</span>
                      {targetBizs.length > 1 ? ` and ${targetBizs.length - 1} more` : ''}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNav('management')}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Review & Approve Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}
          {/* 1. Dashboard Tab */}
          {activeNav === 'dashboard' && (
            <AdminOverviewTab onNavigateTab={handleOverviewNavigate} />
          )}

          {/* 2. Users Tabs (Customers, Partners, Staff) */}
          {activeNav.startsWith('users-') && (
            <AdminUsersTab
              currentSubTab={getCurrentUserSubTab()}
              onSubTabChange={(sub) => setActiveNav(`users-${sub}` as SuperAdminNavTab)}
              hideInternalNav={true}
            />
          )}

          {/* 3. Business Assets Tabs (Onboarding, Organizations, Industries, Categories, Services, Cat Requests) */}
          {activeNav.startsWith('assets-') && (
            <AdminAssetsTab
              currentSubTab={getCurrentAssetSubTab()}
              onSubTabChange={(sub) => {
                if (sub === 'service-categories') setActiveNav('assets-cat-requests');
                else setActiveNav(`assets-${sub}` as SuperAdminNavTab);
              }}
              hideInternalNav={true}
            />
          )}

          {/* 4. Business Management (KYC review & applications) */}
          {activeNav === 'management' && <AdminBusinessManagementTab />}

          {/* 5. Payment Configuration */}
          {activeNav === 'payment' && (
            <AdminPaymentTab onSaveSuccess={(rate) => showToast(`Payment percentage updated to ${rate}% successfully!`)} />
          )}

          {/* 6. Configuration & System Settings */}
          {activeNav === 'settings' && <AdminConfigurationTab />}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. SYSTEM & AUDIT LOGS MODAL                                              */}
      {/* ========================================================================= */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">System & Audit Logs</h3>
                  <p className="text-xs text-slate-500">Live operational ledger of Super Admin actions</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <span className="text-emerald-600 font-bold">[200 OK]</span>{' '}
                  <span className="text-slate-800 font-semibold">GET /api/v1/admin/categories</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Loaded 4 active business categories with service counts.</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Just now</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <span className="text-blue-600 font-bold">[AUTH]</span>{' '}
                  <span className="text-slate-800 font-semibold">SuperAdmin Session Initialized</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Session token granted with elevated multi-tenant permissions.</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">2m ago</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <span className="text-purple-600 font-bold">[KYC]</span>{' '}
                  <span className="text-slate-800 font-semibold">KYC Verification Rule Synchronized</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Automated document check enabled for UK Companies House records.</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">15m ago</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
                <div>
                  <span className="text-amber-600 font-bold">[CONFIG]</span>{' '}
                  <span className="text-slate-800 font-semibold">Platform Commission Tier Updated</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Default merchant rate configured to 12.5% standard take-rate.</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">1h ago</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUPER ADMIN HELP & DOCUMENTATION MODAL                                 */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Super Admin Guide</h3>
                  <p className="text-xs text-slate-500">Overview of platform capabilities and navigation</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Business Assets Directory</h4>
                <p>
                  Manage master categories, industry clusters, service catalogues, and incoming merchant requests.
                  Highlight recommended categories to elevate them on the consumer marketplace.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Users & Access Control</h4>
                <p>
                  Review Customers, Business Partners, and On-site Staff. You can suspend or reactivate profiles and masquerade into their perspective with the demo role switcher.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">KYC Review Queue</h4>
                <p>
                  Inspect business licenses, insurance certificates, and banking credentials for new merchant applicants.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
