import React from 'react';
import { Globe, AtSign, Send, Rss } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

export const CustomerFooter: React.FC = () => {
  const { loginAsUser } = useDemo();

  return (
    <footer className="bg-[#F9FAFB] border-t border-slate-200/80 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-slate-200/60">
          {/* Brand & Socials */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-base font-black tracking-[0.24em] text-slate-950 uppercase">
              U R S P O T
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Redefining the booking experience for premium lifestyle services across the globe.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Global Network"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Threads / Email"
              >
                <AtSign className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Telegram / Community"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                title="Feed / Blog"
              >
                <Rss className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider">Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => loginAsUser('business')}
                  className="text-slate-600 hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  For Business
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <span className="hover:text-slate-950 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-slate-950 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-slate-950 transition-colors cursor-pointer">
                  Report a Problem
                </span>
              </li>
              <li>
                <span className="hover:text-slate-950 transition-colors cursor-pointer">
                  Cookie Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Download Badges */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider">Download</h4>
            <div className="space-y-2.5">
              {/* App Store Badge */}
              <button
                type="button"
                className="w-full max-w-[210px] bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-neutral-800 transition-colors text-left shadow-xs cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.02-.49 2.64-1.24z" />
                </svg>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">
                    Download on the
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">App Store</div>
                </div>
              </button>

              {/* Google Play Badge */}
              <button
                type="button"
                className="w-full max-w-[210px] bg-white border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors text-left shadow-2xs cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M3.6 1.8c-.3.3-.4.8-.4 1.4v17.6c0 .6.1 1.1.4 1.4l9.2-10.2L3.6 1.8z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M16.9 14.8l-4.1-2.8 4.1-2.8 2.7 1.5c.8.5.8 1.2 0 1.7l-2.7 2.4z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12.8 12L3.6 22.2c.4.2 1 .2 1.6-.1l11.7-6.6-4.1-3.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M12.8 12l4.1-3.5L5.2 1.9C4.6 1.6 4 1.6 3.6 1.8L12.8 12z"
                  />
                </svg>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">
                    Get it on the
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div>© 2024 URSPOT. All rights reserved.</div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Support</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
