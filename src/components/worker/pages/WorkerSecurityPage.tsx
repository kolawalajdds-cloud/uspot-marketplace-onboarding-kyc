import React, { useState } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  CheckCircle2,
  Circle,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import { UserProfile } from '../../../types';

interface WorkerSecurityPageProps {
  worker: UserProfile;
  onNavigate?: (page: string) => void;
}

export const WorkerSecurityPage: React.FC<WorkerSecurityPageProps> = ({
  worker,
  onNavigate,
}) => {
  const { currentUser, addNotification } = useDemo();
  const activeWorker = (currentUser && currentUser.id === worker.id ? currentUser : worker) || worker;

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Eye toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search state for topbar
  const [searchQuery, setSearchQuery] = useState('');

  // Validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperLower = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCriteria = [hasMinLength, hasUpperLower, hasSpecial].filter(Boolean).length;

  let strengthLabel = 'Weak';
  let strengthBars = 1;
  let strengthColor = 'bg-rose-500';

  if (newPassword.length === 0) {
    strengthLabel = 'Weak';
    strengthBars = 0;
    strengthColor = 'bg-gray-200';
  } else if (passedCriteria === 1) {
    strengthLabel = 'Weak';
    strengthBars = 1;
    strengthColor = 'bg-rose-500';
  } else if (passedCriteria === 2) {
    strengthLabel = 'Medium';
    strengthBars = 2;
    strengthColor = 'bg-amber-500';
  } else if (passedCriteria === 3) {
    strengthLabel = 'Strong';
    strengthBars = 4;
    strengthColor = 'bg-emerald-500';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Please enter your current account password.' });
      return;
    }

    if (!hasMinLength) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback({
        type: 'success',
        message: 'Password updated successfully! Future logins will require this new password.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addNotification({
        message: 'Security Alert: Your password was updated successfully.',
        type: 'success',
        read: false,
      });
    }, 700);
  };

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR (Exact match to Image 4)                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platform..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100/90 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('/worker/dashboard')}
            className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:border-black text-gray-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Switch Role
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-gray-900">
                {activeWorker.name || 'Marcus Vance'}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold">
                {activeWorker.jobTitle || 'Contractor'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
              {activeWorker.avatar ? (
                <img
                  src={activeWorker.avatar}
                  alt={activeWorker.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                'MV'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BREADCRUMB & HEADER (Exact match to Image 4)                           */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto text-left">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => onNavigate?.('/worker/profile')}>
            Profile
          </span>
          <span>/</span>
          <span className="text-gray-900 font-bold">Change Password</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Change Password
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Ensure your account stays secure by updating your password regularly.
        </p>
      </div>

      {feedback && (
        <div
          className={`max-w-xl mx-auto p-3.5 rounded-xl border text-xs flex items-center justify-between font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN FORM CARD (Exact match to Image 4)                                */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-7 sm:p-8 border border-gray-100 shadow-xs relative overflow-hidden">
        {/* Subtle Watermark Illustration */}
        <div className="absolute -bottom-8 -right-8 w-44 h-44 text-gray-100 pointer-events-none stroke-1 opacity-60">
          <Lock className="w-full h-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 4-bar dynamic strength meter */}
            <div className="mt-2.5 space-y-1">
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx < strengthBars ? strengthColor : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-400 italic">
                Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Requirements Checklist Box */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-gray-900 mb-2">
              Security Requirements:
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {hasMinLength ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span className={hasMinLength ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  At least 8 characters long
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasUpperLower ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span className={hasUpperLower ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One uppercase &amp; one lowercase character
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasSpecial ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span className={hasSpecial ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  One special character (e.g. !@#$%)
                </span>
              </div>
            </div>
          </div>

          {/* Full-width Pitch Black Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Update Password</span>
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 4. TWO-FACTOR AUTHENTICATION BOTTOM CARD (Exact match to Image 4)          */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-extrabold text-gray-900 text-xs">
            Two-Factor Authentication
          </h4>
          <p className="text-gray-500 mt-1 leading-relaxed">
            Want more security? Enable 2FA to add an extra layer of protection to your Workforce account.
          </p>
          <button
            type="button"
            onClick={() => alert('2FA Setup will generate a QR code for your authenticator app.')}
            className="font-bold text-gray-900 underline mt-2 block hover:text-black cursor-pointer"
          >
            Enable 2FA now
          </button>
        </div>
      </div>
    </div>
  );
};
