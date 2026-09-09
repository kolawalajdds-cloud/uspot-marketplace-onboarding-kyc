import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { UserProfile } from '../../types';
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
} from 'lucide-react';

interface LoginViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ isModal = false, onClose }) => {
  const { users, loginAsUser, currentUser } = useDemo();
  const [selectedRole, setSelectedRole] = useState<string>(currentUser?.role || users[0]?.role || 'customer');
  const [customEmail, setCustomEmail] = useState<string>(currentUser?.email || users[0]?.email || 'customer@uspot.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>USPOT Multi-Tenant Marketplace Authentication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to USPOT Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
            Select one of the 4 seeded demo user accounts below to experience dedicated role workspaces.
          </p>
        </div>

        {/* 4 Seeded Users Quick-Login Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {users.map((user) => {
            const meta = roleDescriptions[user.role] || roleDescriptions.customer;
            const IconComponent = meta.icon;
            const isCurrent = currentUser?.id === user.id;
            const isSelected = selectedRole === user.role;

            return (
              <div
                key={user.id}
                id={`login-card-${user.role}`}
                onClick={() => handleSelectUser(user)}
                className={`group relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
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
                          ? 'bg-indigo-600 text-white shadow-inner'
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
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {meta.desc}
                  </p>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  id={`quick-login-btn-${user.role}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLogin(user);
                  }}
                  disabled={isSubmitting}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>Sign In as {user.roleLabel}</span>
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
      </div>
    </div>
  );
};
