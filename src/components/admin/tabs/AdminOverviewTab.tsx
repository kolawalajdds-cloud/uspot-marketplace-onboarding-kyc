import React, { useState } from 'react';
import { useDemo } from '../../../context/DemoContext';
import { StatusBadge, RiskTierBadge } from '../../StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  Tag,
  Key,
  Globe,
  Layers,
  Building2,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Shield,
  FileCheck2,
  Users,
  Server,
  Database,
  Cpu,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface AdminOverviewTabProps {
  onNavigateTab: (tabKey: 'dashboard' | 'users' | 'assets' | 'management' | 'config') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigateTab }) => {
  const { currentUser, state, selectBusinessForAdmin, setAdminView } = useDemo();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const pendingQueue = state.businesses.filter((b) => b.status === 'Pending KYC Review');
  const liveCount = state.businesses.filter((b) => b.status === 'Live').length;
  const draftCount = state.businesses.filter((b) => b.status === 'Draft').length;
  const kycApprovedCount = state.businesses.filter((b) => b.status === 'KYC Approved').length;

  const totalUsers = state.users.length;
  const customersCount = state.users.filter((u) => u.role === 'customer').length;
  const partnersCount = state.users.filter((u) => u.role === 'business').length;
  const staffCount = state.users.filter((u) => u.role === 'specialist').length;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const user = currentUser || {
    id: 'user-superadmin',
    role: 'super_admin' as const,
    roleLabel: 'Superadmin' as const,
    status: 'active' as const,
    email: 'admin@uspot.com',
    username: 'admin_user',
    phone: '+15550104',
    nickname: 'Super',
    fullName: 'Super Admin',
    referralCode: '—',
    emailVerified: true,
    phoneVerified: true,
    timezone: 'UTC',
    memberSince: 'Aug 13, 2026',
    avatarInitials: 'SA',
  };

  const handleReviewBusiness = (businessId: string) => {
    selectBusinessForAdmin(businessId);
    setAdminView('detail');
    onNavigateTab('management');
  };

  return (
    <div id="admin-overview-tab" className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Admin Profile Header Banner */}
      <div
        id="superadmin-welcome-banner"
        className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shadow-inner border border-indigo-400/30 shrink-0">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 id="welcome-superadmin-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome, Super Admin!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Super Admin Authority
                </span>
              </div>
              <p id="superadmin-email-display" className="text-sm font-medium text-slate-300 mt-1 font-mono">
                {user.email}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Central command console for multi-tenant identity, compliance verification, and marketplace infrastructure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="overview-quick-users-btn"
              onClick={() => onNavigateTab('users')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Users ({totalUsers})</span>
            </button>
            <button
              id="overview-quick-review-btn"
              onClick={() => onNavigateTab('management')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review KYC ({pendingQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Six Key Metrics Bar */}
        <div
          id="superadmin-key-metrics-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80"
        >
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Role
            </span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span id="metric-role" className="font-mono text-sm font-bold text-white truncate">
                {user.role}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="metric-status" className="font-semibold text-sm text-emerald-300 capitalize">
                {user.status}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Email Verified
            </span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span id="metric-email-verified" className="font-bold text-sm text-slate-100">
                Verified
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Phone Verified
            </span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span id="metric-phone-verified" className="font-bold text-sm text-slate-100">
                Verified
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Timezone
            </span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span id="metric-timezone" className="font-mono text-sm font-semibold text-slate-200">
                {user.timezone}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Member Since
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span id="metric-member-since" className="text-xs font-semibold text-slate-200">
                {user.memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Admin Profile Details + System Status (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Admin Profile Card */}
        <div
          id="superadmin-profile-details-card"
          className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6"
        >
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Admin Profile Details</h2>
                <p className="text-xs text-slate-500">Super Administrator identity & credentials</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <User className="w-4 h-4 text-slate-400" />
                <span>Username</span>
              </div>
              <div className="flex items-center gap-2">
                <span id="detail-username" className="text-xs font-mono font-bold text-slate-900">
                  {user.username}
                </span>
                <button
                  onClick={() => handleCopy(user.username, 'username')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy username"
                >
                  {copiedField === 'username' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <span id="detail-email" className="text-xs font-mono font-bold text-slate-900">
                  {user.email}
                </span>
                <button
                  onClick={() => handleCopy(user.email, 'email')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <span id="detail-phone" className="text-xs font-mono font-bold text-slate-900">
                  {user.phone}
                </span>
                <button
                  onClick={() => handleCopy(user.phone, 'phone')}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copy phone"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Nickname</span>
              </div>
              <span id="detail-nickname" className="text-xs font-semibold text-slate-800">
                {user.nickname}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <User className="w-4 h-4 text-slate-400" />
                <span>Full Name</span>
              </div>
              <span id="detail-fullname" className="text-xs font-bold text-slate-900">
                {user.fullName}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Key className="w-4 h-4 text-slate-400" />
                <span>Referral Code</span>
              </div>
              <span id="detail-referral" className="text-xs font-mono text-slate-400 font-semibold">
                {user.referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: System Status & Infrastructure Card */}
        <div
          id="superadmin-system-status-card"
          className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6"
        >
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">System Status</h2>
                <p className="text-xs text-slate-500">Marketplace health, cloud infrastructure & uptime</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              99.98% Operational
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold">API Gateway</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">24ms</span>
                <span className="text-[11px] text-emerald-600 font-bold">Fast Ingress</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">SSL / TLS 1.3 Strict</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Database className="w-3.5 h-3.5 text-sky-500" />
                <span className="font-semibold">Data Persistence</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">Healthy</span>
                <span className="text-[11px] text-emerald-600 font-bold">Encrypted</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">AES-256 at Rest</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">KYC Verification API</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">Online</span>
                <span className="text-[11px] text-indigo-600 font-bold">v3.4</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">IRS TIN Match / Plaid</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold">Compliance Engine</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">SOC2 Type II</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Zero security incidents</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                UTC
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Primary Region: Global Ingress (UTC)</p>
                <p className="text-[11px] text-slate-500">Synchronized distributed transaction logs</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('config')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Businesses & Customers Summary (Two Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Businesses Card */}
        <div
          id="overview-businesses-card"
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Marketplace Businesses</h3>
                  <p className="text-xs text-slate-500">Venues, co-working & commercial partners</p>
                </div>
              </div>
              <span className="text-xl font-black text-slate-900">{state.businesses.length}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-emerald-600 block">{liveCount}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Live</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-amber-600 block">{pendingQueue.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Pending KYC</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-600 block">{draftCount}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Draft</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>{liveCount}</strong> verified venues actively accept bookings from customers.
              {pendingQueue.length > 0 && (
                <span className="text-amber-700 font-semibold ml-1">
                  {pendingQueue.length} requires super-admin KYC review.
                </span>
              )}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Merchant subscriptions & filings</span>
            <button
              id="overview-to-biz-management-btn"
              onClick={() => onNavigateTab('management')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Businesses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Customers Card */}
        <div
          id="overview-customers-card"
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Registered Customers</h3>
                  <p className="text-xs text-slate-500">Renters, team leads & event organizers</p>
                </div>
              </div>
              <span className="text-xl font-black text-slate-900">{customersCount}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-900 block">{partnersCount}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Partners</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-900 block">{staffCount}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Staff</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-indigo-600 block">100%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Auth Active</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customers have verified email credentials and can browse verified inventory, book desks or event venues, and manage invoices.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Customer and role governance</span>
            <button
              id="overview-to-users-btn"
              onClick={() => onNavigateTab('users')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Pending KYC Review Card / Queue */}
      <div
        id="overview-pending-kyc-card"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending KYC Review Queue</h3>
              <p className="text-xs text-slate-500">Businesses awaiting Super Admin compliance verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingQueue.length} In Queue
            </span>
            <button
              onClick={() => onNavigateTab('management')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">All KYC Reviews Caught Up!</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no merchant applications awaiting review. All submitted businesses have been audited.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Business & Entity</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">TIN / EIN</th>
                  <th className="py-2.5 px-3">Beneficial Owner</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingQueue.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.coreDetails.businessName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{b.coreDetails.legalEntityName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{b.coreDetails.category}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {b.verification.einVerification.einEntered || 'EIN Verified'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{b.verification.beneficialOwner.fullName}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        SSN: •••-••-{b.verification.beneficialOwner.ssnLast4}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskTierBadge tier={b.verification.riskTier} />
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {b.verification.submittedAt
                        ? new Date(b.verification.submittedAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleReviewBusiness(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Audit KYC</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
