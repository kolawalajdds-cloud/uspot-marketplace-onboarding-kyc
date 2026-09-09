import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import { User, LogOut, Shield, Building2, Users, Check } from 'lucide-react';

interface CustomerNavbarProps {
  activePage: 'home' | 'categories' | 'cities';
  setActivePage: (page: 'home' | 'categories' | 'cities') => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({ activePage, setActivePage }) => {
  const { currentUser, loginAsUser, logout, setAuthModalOpen } = useDemo();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems: Array<{ id: 'home' | 'categories' | 'cities'; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Categories' },
    { id: 'cities', label: 'Cities' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => setActivePage('home')}
            className="text-lg font-black tracking-[0.22em] text-slate-950 uppercase hover:opacity-85 transition-opacity cursor-pointer"
          >
            U R S P O T
          </button>
        </div>

        {/* Center Navigation: Home, Categories, Cities */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-xs sm:text-sm font-semibold transition-all relative py-1 cursor-pointer ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right User Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="User Profile & Roles"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {/* Profile & Switcher Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {currentUser?.fullName || 'Customer User'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Customer
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                    {currentUser?.email || 'customer@uspot.com'}
                  </span>
                </div>

                {/* Role Switcher */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Workspace
                </div>
                <div className="space-y-1 mb-2">
                  <button
                    onClick={() => {
                      loginAsUser('business');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Business Portal
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsUser('staff');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      Staff / Specialist
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsUser('admin');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      Super Admin
                    </span>
                  </button>
                </div>

                {/* Logout button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
