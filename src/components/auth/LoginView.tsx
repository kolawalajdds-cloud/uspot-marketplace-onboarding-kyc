import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { UserProfile, NmiPaymentAccountData } from '../../types';
import { getSeedUsers } from '../../data/seedUsers';
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
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { RegisterWizard } from './RegisterWizard';

interface LoginViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ isModal = false, onClose }) => {
  const {
    state,
    users,
    loginAsUser,
    currentUser,
  } = useDemo();

  // Use static preset accounts for quick access tiles (zero DB queries on page load)
  const demoAccounts = React.useMemo(() => getSeedUsers(), []);
  const accountsToDisplay = users.length > 0 ? users : demoAccounts;
  const initialUser = accountsToDisplay[0];

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || initialUser?.id || '');
  const [selectedRole, setSelectedRole] = useState<string>(currentUser?.role || initialUser?.role || 'business');
  const [customEmail, setCustomEmail] = useState<string>(currentUser?.email || initialUser?.email || '');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleDescriptions: Record<string, { desc: string; icon: any; color: string; badgeColor: string }> = {
    customer: {
      desc: 'Browse live marketplace spaces, check real-time availability, and request bookings.',
      icon: User,
      color: 'from-emerald-950 to-slate-900 border-emerald-500/30 text-emerald-400',
      badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-700/50',
    },
    business: {
      desc: 'Merchant owner portal for managing venues, configuring pricing, and viewing bookings.',
      icon: Building2,
      color: 'from-blue-900 to-slate-900 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700/50',
    },
    worker: {
      desc: 'Field worker & certified technician for assigned shifts, check-ins, earnings, and contracts.',
      icon: Wrench,
      color: 'from-blue-950 to-slate-900 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700/50',
    },
    specialist: {
      desc: 'Field worker & certified technician for assigned shifts, check-ins, earnings, and contracts.',
      icon: Wrench,
      color: 'from-blue-950 to-slate-900 border-blue-500/30 text-blue-400',
      badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700/50',
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
    setErrorMessage(null);
  };

  const handleQuickLogin = async (user: UserProfile) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await loginAsUser(user.email || user.id, password);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to authenticate user.');
      } else {
        if (user.role === 'worker' || user.role === 'specialist') {
          window.history.pushState(null, '', '/worker/dashboard');
        }
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error authenticating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await loginAsUser(customEmail, password);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Invalid credentials or user not found.');
      } else {
        if (result?.user && (result.user.role === 'worker' || result.user.role === 'specialist')) {
          window.history.pushState(null, '', '/worker/dashboard');
        }
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Auth Mode Toggle Pill (Sign In Mode) */}
        {authMode === 'signin' && (
          <div className="flex items-center justify-center mb-6 pt-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                id="auth-mode-signin-btn"
                onClick={() => setAuthMode('signin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-900 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (Demo Workspaces)</span>
              </button>
              <button
                type="button"
                id="auth-mode-register-btn"
                onClick={() => setAuthMode('register')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-500 hover:text-slate-900"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register as Vendor / User</span>
              </button>
            </div>
          </div>
        )}

        {/* 3-STEP VENDOR & USER REGISTRATION FLOW */}
        {authMode === 'register' && (
          <RegisterWizard
            onSwitchToLogin={() => setAuthMode('signin')}
            onSuccess={() => {
              if (onClose) onClose();
            }}
          />
        )}

        {/* SIGN IN MODE */}
        {authMode === 'signin' && (
          <div className="space-y-8">
            {/* Primary Dynamic Credential Sign In Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sign in to your account</h2>
                  <p className="text-xs text-slate-500">
                    Authenticate directly against the database with your email & password.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g. test@jay.com"
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
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
                      className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    id="submit-login-form-btn"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

                <div className="text-center pt-3 border-t border-slate-100 mt-4">
                  <p className="text-xs text-slate-500">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      id="switch-to-register-link-btn"
                      onClick={() => setAuthMode('register')}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Register as User or Vendor
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Quick Access Accounts (Presets for testing and evaluation) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Registered Accounts (Quick Access)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click any account to auto-fill credentials or sign in instantly.
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {accountsToDisplay.length} Active {accountsToDisplay.length === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {accountsToDisplay.map((user) => {
                  const meta = roleDescriptions[user.role] || roleDescriptions.customer;
                  const isCurrent = currentUser?.id === user.id;
                  const isSelected = selectedUserId === user.id;

                  const userBiz = state.businesses.find(
                    (b) =>
                      (b.userId && b.userId === user.id) ||
                      (b.email && user.email && b.email.toLowerCase() === user.email.toLowerCase())
                  );
                  const businessName =
                    userBiz?.coreDetails?.businessName ||
                    (user.role === 'business' || user.department ? user.department : null);

                  return (
                    <div
                      key={user.id}
                      id={`login-card-${user.id}`}
                      onClick={() => handleSelectUser(user)}
                      className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Role and Current Pill */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? meta.badgeColor
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {user.roleLabel || user.role}
                          </span>

                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Current
                            </span>
                          )}
                        </div>

                        {/* User Avatar and Info */}
                        <div className="flex items-center gap-2.5 mb-2.5">
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
                            <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {user.fullName}
                            </div>
                            <div className={`text-[11px] font-mono truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {user.email}
                            </div>
                          </div>
                        </div>

                        {/* Business Badge if Vendor */}
                        {businessName && (
                          <div className={`mb-3 py-1.5 px-2.5 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 ${
                            isSelected ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate font-bold">{businessName}</span>
                          </div>
                        )}
                      </div>

                      {/* Instant Sign In Button */}
                      <button
                        type="button"
                        id={`quick-login-btn-${user.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(user);
                        }}
                        disabled={isSubmitting}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2 ${
                          isSelected
                            ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
