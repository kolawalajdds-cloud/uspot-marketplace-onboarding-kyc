import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { UserProfile } from '../../../types';

interface WorkerAuthLoginPageProps {
  onLoginSuccess: (worker: UserProfile) => void;
  onNavigate: (page: string) => void;
}

export const WorkerAuthLoginPage: React.FC<WorkerAuthLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [identifier, setIdentifier] = useState('morgan.blake@uspot.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guarantee that browser URL is {baseURL}/worker/login
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() !== '/worker/login') {
      window.history.replaceState({ page: 'login' }, '', '/worker/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or phone.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await workerService.login(identifier.trim());
      if (res.success && res.worker) {
        onLoginSuccess(res.worker);
        onNavigate('dashboard');
      } else {
        setErrorMessage('Incorrect password. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (email: string) => {
    setIdentifier(email);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-slate-100">

      {/* Main Login Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full">
          {/* Title and Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Worker Portal Login
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Welcome back. Please enter your details.
            </p>
          </div>

          {/* Thin Divider */}
          <div className="border-b border-slate-100 my-6" />

          {/* Admin / Account Subtext */}
          <div className="text-center text-sm text-slate-500 mb-6">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="font-bold text-black hover:underline cursor-pointer inline-block"
            >
              Contact your administrator
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Email or Phone
              </label>
              <div className="relative flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email or phone"
                  required
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Password
              </label>
              <div
                className={`relative flex items-center rounded-lg border px-3.5 py-3 bg-white transition-all ${
                  errorMessage
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200'
                    : 'border-slate-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black'
                }`}
              >
                <Lock className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm text-slate-700">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  alert(
                    'Password reset link has been dispatched to your verified worker phone or email address.'
                  );
                }}
                className="text-sm font-semibold text-slate-900 underline hover:text-black cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-lg bg-black hover:bg-neutral-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span className="font-semibold text-slate-700">Demo Accounts (Neon DB)</span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Database
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('morgan.blake@uspot.com')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-black bg-slate-50/50 hover:bg-slate-50 text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Morgan Blake</div>
                <div className="text-[11px] text-slate-500 truncate">morgan.blake@uspot.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('elena.vance@uspot.com')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-black bg-slate-50/50 hover:bg-slate-50 text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Elena Vance</div>
                <div className="text-[11px] text-slate-500 truncate">elena.vance@uspot.com</div>
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => onNavigate('onboarding')}
                className="text-xs text-slate-500 hover:text-black transition-colors"
              >
                Need to create a new worker profile?{' '}
                <span className="font-bold text-black hover:underline">
                  Start Registration Wizard →
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};
