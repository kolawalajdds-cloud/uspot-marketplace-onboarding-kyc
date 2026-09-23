import React, { useState, useEffect, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import { UserProfile, WorkerJob, WorkerAvailabilityStatus } from '../../types';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  DollarSign,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  LifeBuoy,
  Shield,
  User,
  HelpCircle,
  ChevronDown,
  Check,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Award,
  CreditCard,
  TrendingUp,
  Plus,
} from 'lucide-react';

// Subpages
import { WorkerDashboardPage } from './pages/WorkerDashboardPage';
import { WorkerAuthLoginPage } from './pages/WorkerAuthLoginPage';
import { WorkerOnboardingPage } from './pages/WorkerOnboardingPage';
import { WorkerJobsListPage } from './pages/WorkerJobsListPage';
import { WorkerJobDetailPage } from './pages/WorkerJobDetailPage';
import { WorkerCalendarPage } from './pages/WorkerCalendarPage';
import { WorkerContractsPage } from './pages/WorkerContractsPage';
import { WorkerCheckInPage } from './pages/WorkerCheckInPage';
import { WorkerCheckOutPage } from './pages/WorkerCheckOutPage';
import { WorkerEarningsPage } from './pages/WorkerEarningsPage';
import { WorkerTransactionsPage } from './pages/WorkerTransactionsPage';
import { WorkerMultiBusinessSchedulePage } from './pages/WorkerMultiBusinessSchedulePage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { WorkerSecurityPage } from './pages/WorkerSecurityPage';
import { WorkerNotificationsPage } from './pages/WorkerNotificationsPage';
import { WorkerSupportTicketsPage } from './pages/WorkerSupportTicketsPage';
import { WorkerPerformancePage } from './pages/WorkerPerformancePage';

export const WorkerPortal: React.FC = () => {
  const {
    currentUser,
    logout,
    setCurrentUser,
    updateWorkerStatus,
    allNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useDemo();

  // Parse initial route from window.location.pathname
  const getSubpageFromPath = (): string => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/worker/login')) return 'login';
    if (path.includes('/worker/onboarding')) return 'onboarding';
    if (path.includes('/worker/jobs/')) return 'job-details';
    if (path.includes('/worker/jobs')) return 'jobs';
    if (path.includes('/worker/schedule')) return 'schedule';
    if (path.includes('/worker/calendar')) return 'calendar';
    if (path.includes('/worker/contracts')) return 'contracts';
    if (path.includes('/worker/check-in')) return 'check-in';
    if (path.includes('/worker/check-out')) return 'check-out';
    if (path.includes('/worker/earnings')) return 'earnings';
    if (path.includes('/worker/transactions')) return 'transactions';
    if (path.includes('/worker/profile')) return 'profile';
    if (path.includes('/worker/security') || path.includes('/worker/password')) return 'security';
    if (path.includes('/worker/notifications')) return 'notifications';
    if (path.includes('/worker/support') || path.includes('/worker/tickets')) return 'support-tickets';
    if (path.includes('/worker/performance')) return 'performance';
    if (path.includes('/worker/dashboard') || path === '/worker' || path === '/worker/') {
      return 'dashboard';
    }
    return 'dashboard';
  };

  const [activePage, setActivePage] = useState<string>(getSubpageFromPath);
  const [selectedJob, setSelectedJob] = useState<WorkerJob | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Sync URL changes via pushState and popstate
  const navigateTo = (page: string, params?: { job?: WorkerJob }) => {
    setActivePage(page);
    if (params?.job) {
      setSelectedJob(params.job);
    }
    setMobileMenuOpen(false);
    setIsNotifDropdownOpen(false);
    setIsProfileDropdownOpen(false);

    let newUrl = `/worker/${page}`;
    if (page === 'job-details' && params?.job) {
      newUrl = `/worker/jobs/${params.job.id}`;
    } else if (page === 'job-details') {
      newUrl = selectedJob ? `/worker/jobs/${selectedJob.id}` : '/worker/jobs';
    }

    if (window.location.pathname !== newUrl) {
      window.history.pushState({ page }, '', newUrl);
    }
  };

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getSubpageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync URL on initial mount if on root worker route
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/worker' || path === '/worker/') {
      window.history.replaceState(null, '', '/worker/dashboard');
    }
  }, []);

  // Worker user fallback matching reference image (John Doe, JD)
  const worker: UserProfile =
    currentUser && (currentUser.role === 'worker' || currentUser.role === 'specialist')
      ? currentUser
      : {
          id: 'user-specialist',
          role: 'worker',
          roleLabel: 'Worker',
          status: 'active',
          email: 'john.doe@uspot.com',
          username: 'john_doe',
          phone: '+1 (555) 876-5432',
          nickname: 'John',
          fullName: 'John Doe',
          referralCode: 'USPOT-WRK42',
          emailVerified: true,
          phoneVerified: true,
          timezone: 'America/New_York',
          memberSince: 'Feb 14, 2023',
          avatarInitials: 'JD',
          department: 'Field Operations Specialist',
          primaryServiceCategory: 'General Maintenance, Plumbing, Cleaning',
          yearsOfExperience: 8,
          hourlyRate: 85,
          rating: 4.8,
          availabilityStatus: 'available',
          statusNote: 'Ready for emergency and scheduled shifts',
        };

  const currentAvailability: WorkerAvailabilityStatus = worker.availabilityStatus || 'available';

  const handleStatusChange = (status: WorkerAvailabilityStatus, note?: string) => {
    updateWorkerStatus(worker.id, status, note);
  };

  // If page is login or onboarding, render full screen auth views
  if (activePage === 'login') {
    return (
      <WorkerAuthLoginPage
        onLoginSuccess={(loggedWorker) => {
          setCurrentUser(loggedWorker);
          navigateTo('dashboard');
        }}
        onNavigate={(p) => navigateTo(p)}
      />
    );
  }

  if (activePage === 'onboarding') {
    return (
      <WorkerOnboardingPage
        onOnboardingComplete={(onboardedWorker) => {
          setCurrentUser(onboardedWorker);
          navigateTo('dashboard');
        }}
        onNavigate={(p) => navigateTo(p)}
      />
    );
  }

  // Navigation Items matching the reference screenshot exactly:
  // DASHBOARD, MY JOBS, SCHEDULE, MY CONTRACTS, EARNINGS, PROFILE, NOTIFICATIONS, PERFORMANCE, SUPPORT TICKETS
  const mainNavItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'jobs', label: 'MY JOBS', icon: Briefcase },
    { id: 'calendar', label: 'SCHEDULE', icon: Calendar },
    { id: 'contracts', label: 'MY CONTRACTS', icon: FileText },
    { id: 'earnings', label: 'EARNINGS', icon: DollarSign },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, badge: unreadNotificationCount },
    { id: 'performance', label: 'PERFORMANCE', icon: TrendingUp },
    { id: 'support-tickets', label: 'SUPPORT TICKETS', icon: LifeBuoy },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB] text-neutral-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. PITCH-BLACK SIDEBAR (Exact match to reference screenshots)             */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col shrink-0 w-60 lg:w-64 bg-black text-white select-none z-30 justify-between border-r border-neutral-900">
        <div>
          {/* Top Brand / Worker Dashboard Header */}
          <div className="p-6 pb-6 border-b border-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm shadow-md shrink-0">
                {worker.avatarInitials || 'JD'}
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-bold text-sm tracking-tight leading-tight truncate">
                  Worker Dashboard
                </h1>
                <p className="text-neutral-400 text-[11px] font-semibold tracking-wider uppercase mt-0.5 truncate">
                  URSPOT Platform
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activePage === item.id ||
                (item.id === 'jobs' && activePage === 'job-details');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Logout Button */}
        <div className="p-4 border-t border-neutral-900 space-y-2">
          {activePage === 'support-tickets' && (
            <button
              type="button"
              onClick={() => navigateTo('support-tickets')}
              className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-gray-100 text-black text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Request</span>
            </button>
          )}

          {activePage === 'performance' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigateTo('support-tickets')}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Support</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Exporting full performance PDF report...')}
                className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-gray-100 text-black text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Export Report</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTAINER & TOPBAR                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar matching reference */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          {/* Left: Mobile hamburger + URSPOT Brand Logo + Marketplace / Community links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => navigateTo('dashboard')}
              className="text-xl font-black tracking-tight text-black cursor-pointer select-none"
            >
              URSPOT
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Marketplace
              </button>
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Community
              </button>
            </div>
          </div>

          {/* Right: Search, Support, Docs, Notifications, Profile Pill */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigateTo('jobs')}
              className="text-gray-500 hover:text-black transition-colors p-1.5 cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('support-tickets')}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block cursor-pointer"
            >
              Support
            </button>

            <button
              type="button"
              onClick={() => navigateTo('contracts')}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block cursor-pointer"
            >
              Docs
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-1.5 text-gray-600 hover:text-black transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Preview */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2 px-1">
                    <span className="text-xs font-bold text-gray-900">Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                    {allNotifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          navigateTo('notifications');
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          !n.read
                            ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-50'
                            : 'bg-gray-50/70 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <p className={`text-xs ${!n.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                          {n.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('notifications')}
                      className="w-full py-1 text-center text-xs font-bold text-gray-900 hover:underline cursor-pointer"
                    >
                      View All in Notification Center &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Question Icon */}
            <button
              type="button"
              onClick={() => navigateTo('support-tickets')}
              className="p-1.5 text-gray-500 hover:text-black transition-colors hidden sm:block cursor-pointer"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Profile Avatar Pill & Dropdown (Exact match to top-right in Image 1) */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 sm:gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {worker.avatarInitials || 'JD'}
                </div>
                <div className="text-left hidden lg:block pr-1 leading-tight">
                  <div className="text-xs font-bold text-gray-900">{worker.fullName || 'John Doe'}</div>
                  <div className="text-[11px] text-gray-400 font-medium">Worker Account</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <div className="text-xs font-bold text-gray-900">{worker.fullName || 'John Doe'}</div>
                    <div className="text-[11px] text-gray-500">{worker.email}</div>
                  </div>

                  {/* Availability Status Switcher */}
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Availability Status
                    </span>
                    <div className="space-y-1">
                      {[
                        { id: 'available', label: 'Available', dot: 'bg-emerald-500' },
                        { id: 'busy', label: 'Busy (On Shift)', dot: 'bg-blue-500' },
                        { id: 'break', label: 'On Break', dot: 'bg-amber-500' },
                        { id: 'offline', label: 'Offline', dot: 'bg-gray-400' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            handleStatusChange(s.id as WorkerAvailabilityStatus);
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium flex items-center justify-between cursor-pointer ${
                            currentAvailability === s.id ? 'bg-gray-100 text-black font-bold' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                            <span>{s.label}</span>
                          </div>
                          {currentAvailability === s.id && <Check className="w-3.5 h-3.5 text-black" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => navigateTo('profile')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('security')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span>Security & Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('support-tickets')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-2"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Support & Help</span>
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex md:hidden">
            <div className="w-72 bg-black text-white h-full p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">
                      {worker.avatarInitials || 'JD'}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Worker Dashboard</div>
                      <div className="text-[10px] text-neutral-400 uppercase">URSPOT Platform</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-left cursor-pointer ${
                          isActive ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-lg bg-neutral-900 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Main Subpage Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {activePage === 'dashboard' && (
              <WorkerDashboardPage
                worker={worker}
                onNavigate={(p, params) => navigateTo(p, params)}
                onSelectJob={(j) => setSelectedJob(j)}
              />
            )}

            {activePage === 'jobs' && (
              <WorkerJobsListPage
                workerId={worker.id}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  navigateTo('job-details', { job: j });
                }}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'job-details' && (
              <WorkerJobDetailPage
                job={selectedJob}
                onNavigate={(p) => navigateTo(p)}
                onStartCheckIn={(j) => {
                  setSelectedJob(j);
                  navigateTo('check-in');
                }}
                onStartCheckOut={(j) => {
                  setSelectedJob(j);
                  navigateTo('check-out');
                }}
              />
            )}

            {activePage === 'calendar' && (
              <WorkerCalendarPage
                workerId={worker.id}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  navigateTo('job-details', { job: j });
                }}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'schedule' && (
              <WorkerMultiBusinessSchedulePage workerId={worker.id} />
            )}

            {activePage === 'contracts' && (
              <WorkerContractsPage workerId={worker.id} />
            )}

            {activePage === 'check-in' && (
              <WorkerCheckInPage
                workerId={worker.id}
                selectedJob={selectedJob}
                onNavigate={(p) => navigateTo(p)}
                onJobUpdated={(j) => setSelectedJob(j)}
              />
            )}

            {activePage === 'check-out' && (
              <WorkerCheckOutPage
                workerId={worker.id}
                selectedJob={selectedJob}
                onNavigate={(p) => navigateTo(p)}
                onJobUpdated={(j) => setSelectedJob(j)}
              />
            )}

            {activePage === 'earnings' && (
              <WorkerEarningsPage
                workerId={worker.id}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'transactions' && (
              <WorkerTransactionsPage workerId={worker.id} />
            )}

            {/* FEATURES 14-22 SUBPAGES */}
            {activePage === 'profile' && (
              <WorkerProfilePage
                worker={worker}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'security' && (
              <WorkerSecurityPage
                worker={worker}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'notifications' && (
              <WorkerNotificationsPage
                worker={worker}
                onNavigate={(p, params) => navigateTo(p, params)}
              />
            )}

            {activePage === 'support-tickets' && (
              <WorkerSupportTicketsPage
                worker={worker}
                onNavigate={(p) => navigateTo(p)}
              />
            )}

            {activePage === 'performance' && (
              <WorkerPerformancePage worker={worker} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
