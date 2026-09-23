import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  ArrowLeft,
  UserCheck,
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
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await workerService.login(identifier);
      if (res.success && res.worker) {
        onLoginSuccess(res.worker);
        onNavigate('dashboard');
      } else {
        setErrorMessage('Worker authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await workerService.login('morgan.blake@uspot.com');
      if (res.success && res.worker) {
        onLoginSuccess(res.worker);
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">URSPOT</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10px] tracking-wider uppercase">
                Worker Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">On-site Specialists & Field Operations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Marketplace Home</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Worker Portal Login</h1>
            <p className="text-xs text-slate-400 mt-1">
              Secure authentication for assigned field specialists, contractors, and service workers.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/50 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Worker Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. morgan.blake@uspot.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0" />
                <span>Remember this station</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('onboarding')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                New Worker?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <span>Verifying Database Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Worker Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Worker Account Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick Demo Sign-In</span>
              <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Database Ready
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                  MB
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    <span>Morgan Blake</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold">
                      Master Worker
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">morgan.blake@uspot.com</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Need to register as an independent specialist?{' '}
              <span className="text-blue-400 font-bold hover:underline">Start Worker Onboarding</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80">
        <div>&copy; 2026 URSPOT Field Operations Platform. All rights reserved.</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Worker Terms</span>
          <span>Safety Standard</span>
          <span>Direct Deposit FAQ</span>
        </div>
      </footer>
    </div>
  );
};
