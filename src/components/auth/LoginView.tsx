import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { UserProfile, NmiPaymentAccountData } from '../../types';
import {
  Shield,
  Building2,
  User,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ExternalLink,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { NmiPaymentAccountSetup } from '../vendor/NmiPaymentAccountSetup';

interface LoginViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ isModal = false, onClose }) => {
  const { state, users, loginAsUser, currentUser, saveVendorBusiness, createUser, selectBusinessForVendor } = useDemo();
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || users[0]?.id || 'user-customer');
  const [selectedRole, setSelectedRole] = useState<string>(currentUser?.role || users[0]?.role || 'customer');
  const [customEmail, setCustomEmail] = useState<string>(currentUser?.email || users[0]?.email || 'customer@uspot.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Vendor Registration State
  const [regFullName, setRegFullName] = useState('Jordan Hayes');
  const [regBusinessName, setRegBusinessName] = useState('Hayes Innovation Hub');
  const [regEmail, setRegEmail] = useState('jordan.hayes@example.com');
  const [regPassword, setRegPassword] = useState('••••••••••••');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const roleDescriptions: Record<string, { desc: string; icon: any; color: string; badgeColor: string }> = {
    customer: {
      desc: 'Browse live marketplace spaces, check real-time availability, and request bookings.',
      icon: User,
      color: 'from-emerald-950 to-slate-900 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-700/50',
    },
    business: {
      desc: 'Merchant owner portal for creating venues, configuring pricing, and submitting KYC filings.',
      icon: Building2,
      color: 'from-blue-900 to-slate-900 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700/50',
    },
    specialist: {
      desc: 'Compliance & operations staff for reviewing documents, entity registry, and risk tiers.',
      icon: Search,
      color: 'from-amber-950 to-slate-900 border-amber-500/30 text-amber-400',
      badgeColor: 'bg-amber-900/80 text-amber-200 border-amber-700/50',
    },
    super_admin: {
      desc: 'Platform governance, KYC compliance review queue, profile details, and merchant approvals.',
      icon: Shield,
      color: 'from-slate-900 to-indigo-950 border-indigo-500/30 text-indigo-400',
      badgeColor: 'bg-indigo-900/80 text-indigo-200 border-indigo-700/50',
    },
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setSelectedRole(user.role);
    setCustomEmail(user.email);
    setPassword('••••••••••••');
  };

  const handleQuickLogin = (user: UserProfile) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsUser(user.id);
      setIsSubmitting(false);
      if (onClose) onClose();
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsUser(customEmail);
      setIsSubmitting(false);
      if (onClose) onClose();
    }, 400);
  };

  const handleRegisterVendorComplete = (skipPaymentSetup: boolean, nmiData?: NmiPaymentAccountData) => {
    const errs: Record<string, string> = {};
    if (!regFullName.trim()) errs.fullName = 'Full name is required';
    if (!regBusinessName.trim()) errs.businessName = 'Business name is required';
    if (!regEmail.trim() || !regEmail.includes('@')) errs.email = 'Valid email is required';

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs);
      return;
    }

    const newUserId = `user-biz-${Date.now()}`;
    const newBizId = `biz-${Date.now()}`;

    const newUser: UserProfile = {
      id: newUserId,
      role: 'business',
      roleLabel: 'Business',
      status: 'active',
      email: regEmail.trim(),
      username: regEmail.split('@')[0],
      phone: '+1 (555) 345-6789',
      nickname: regFullName.split(' ')[0],
      fullName: regFullName.trim(),
      referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      emailVerified: true,
      phoneVerified: true,
      timezone: 'America/Los_Angeles (PST)',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatarInitials: regFullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'V',
    };

    createUser(newUser);

    const initialNmi: NmiPaymentAccountData = nmiData || {
      vendorId: newBizId,
      nmiOnboardingStatus: skipPaymentSetup ? 'SKIPPED' : 'ACTIVE',
      nmiGatewayId: skipPaymentSetup ? null : `NMI-${Math.floor(10000000 + Math.random() * 90000000)}`,
      companyName: regBusinessName.trim(),
      federalTaxId: '12-3456789',
      firstName: regFullName.split(' ')[0],
      lastName: regFullName.split(' ').slice(1).join(' ') || 'Vendor',
      email: regEmail.trim(),
      bankRoutingNumber: skipPaymentSetup ? '' : '125000024',
      bankAccountNumber: skipPaymentSetup ? '' : '987654321',
      accountType: 'checking',
      accountHolderType: 'business',
    };

    saveVendorBusiness({
      id: newBizId,
      businessName: regBusinessName.trim(),
      legalEntityName: regBusinessName.trim(),
      category: 'Coworking & Creative Hub',
      city: 'San Francisco',
      email: regEmail.trim(),
      status: 'KYC Approved',
      servicesCount: 4,
      workersCount: 2,
      nmiPaymentAccount: initialNmi,
    });

    loginAsUser(newUser.id);
    selectBusinessForVendor(newBizId);
    if (onClose) onClose();
  };

  return (
    <div
      id="login-view-container"
      className={`${
        isModal
          ? 'p-6 max-w-4xl w-full'
          : 'min-h-[80vh] flex items-center justify-center py-10 px-4'
      } animate-in fade-in duration-200`}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>USPOT Multi-Tenant Marketplace Authentication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {authMode === 'signin' ? 'Sign In to USPOT Marketplace' : 'Register New Vendor Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
            {authMode === 'signin'
              ? 'Select one of the demo user accounts below to experience dedicated role workspaces.'
              : 'Join the USPOT merchant network. Configure your business profile and set up optional NMI payout settlement.'}
          </p>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              id="auth-mode-signin-btn"
              onClick={() => setAuthMode('signin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (Demo Workspaces)</span>
            </button>
            <button
              type="button"
              id="auth-mode-register-btn"
              onClick={() => setAuthMode('register')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register as Vendor</span>
            </button>
          </div>
        </div>

        {/* VENDOR REGISTRATION MODE */}
        {authMode === 'register' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 1: Basic Vendor Profile Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Vendor & Business Profile</h3>
                    <p className="text-xs text-slate-500">Your core merchant credentials for the USPOT Marketplace</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Step 1 of 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Representative Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Devon Lane"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {regErrors.fullName && <p className="text-xs text-rose-500 mt-1">{regErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder="e.g. Lane Creative Studio LLC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {regErrors.businessName && <p className="text-xs text-rose-500 mt-1">{regErrors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="devon.lane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {regErrors.email && <p className="text-xs text-rose-500 mt-1">{regErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Optional Payment Account Setup Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Optional Setup • Receive Direct Payouts
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Can be configured now or completed upon first balance withdrawal
                </span>
              </div>

              <NmiPaymentAccountSetup
                businessId="biz-new"
                initialData={{
                  companyName: regBusinessName,
                  email: regEmail,
                  firstName: regFullName.split(' ')[0],
                  lastName: regFullName.split(' ').slice(1).join(' ') || 'Partner',
                  bankRoutingNumber: '',
                  bankAccountNumber: '',
                  accountType: 'checking',
                  accountHolderType: 'business',
                }}
                allowSkip={true}
                onSuccess={(accountData) => handleRegisterVendorComplete(false, accountData)}
                onSkip={() => handleRegisterVendorComplete(true)}
                onCancel={() => setAuthMode('signin')}
              />
            </div>
          </div>
        )}

        {/* SIGN IN MODE */}
        {authMode === 'signin' && (
          <>
            {/* Seeded Users Quick-Login Cards (5 Accounts: Customer, 2 Business Owners, Staff, Admin) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {users.map((user) => {
                const meta = roleDescriptions[user.role] || roleDescriptions.customer;
                const isCurrent = currentUser?.id === user.id;
                const isSelected = selectedUserId === user.id;

                let userBiz = state.businesses.find(
                  (b) => b.userId && b.userId === user.id
                );
                if (!userBiz) {
                  userBiz = state.businesses.find(
                    (b) => b.email?.toLowerCase() === user.email?.toLowerCase()
                  );
                }
                if (!userBiz) {
                  if (user.id === 'user-business-2' || user.email.includes('devon')) {
                    userBiz = state.businesses.find((b) => b.id === 'biz-002');
                  } else if (user.id === 'user-business' || user.email.includes('alex')) {
                    userBiz = state.businesses.find((b) => b.id === 'biz-001');
                  }
                }
                const isNmiActive = userBiz?.nmiPaymentAccount?.nmiOnboardingStatus === 'ACTIVE';

                return (
                  <div
                    key={user.id}
                    id={`login-card-${user.id}`}
                    onClick={() => handleSelectUser(user)}
                    className={`group relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Active or Current Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? meta.badgeColor
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {user.roleLabel}
                      </span>

                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Current
                        </span>
                      )}
                    </div>

                    {/* Avatar and User Name */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-white text-slate-900 shadow-inner'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {user.fullName}
                          </div>
                          <div className={`text-[11px] font-mono truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {/* Business Badge for Business Owners */}
                      {userBiz && (
                        <div className={`mb-2.5 py-1 px-2 rounded-lg text-[10px] font-medium border flex items-center justify-between gap-1 ${
                          isSelected ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <span className="truncate max-w-[110px] font-bold">{userBiz.coreDetails.businessName}</span>
                          <span className={`font-bold text-[9px] px-1.5 py-0.2 rounded-full border shrink-0 ${
                            isNmiActive
                              ? isSelected ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isSelected ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {isNmiActive ? 'NMI Active' : 'NMI Skipped'}
                          </span>
                        </div>
                      )}

                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {meta.desc}
                      </p>
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      id={`quick-login-btn-${user.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(user);
                      }}
                      disabled={isSubmitting}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Sign In as {user.nickname || user.fullName}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Credential Form with Pre-selected Values */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Manual Sign In Credentials
              </div>
              <p className="text-xs text-slate-500 mb-5">
                You can also authenticate directly by email. Passwords for all demo accounts are seeded.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="admin@uspot.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  {isModal && onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    id="submit-login-form-btn"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Authorize & Access Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
