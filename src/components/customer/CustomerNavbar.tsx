import React, { useState, useEffect, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import { User, LogOut, Shield, Building2, Users, Check } from 'lucide-react';

export type CustomerNavPage =
  | 'home'
  | 'spots'
  | 'categories'
  | 'cities'
  | 'spot-detail'
  | 'booking'
  | 'my-bookings'
  | 'booking-detail'
  | 'review-service';

interface CustomerNavbarProps {
  activePage: CustomerNavPage;
  setActivePage: (page: CustomerNavPage) => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({ activePage, setActivePage }) => {
  const { currentUser, loginAsUser, logout, setAuthModalOpen } = useDemo();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isProfileOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isProfileOpen]);

  const navItems: Array<{ id: 'home' | 'categories' | 'cities' | 'my-bookings'; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Categories' },
    { id: 'cities', label: 'Cities' },
    { id: 'my-bookings', label: 'My Bookings' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActivePage('home')}
            className="text-lg font-black tracking-[0.05em] text-slate-950 uppercase hover:opacity-85 transition-opacity cursor-pointer flex items-center gap-0.5"
          >
            <span>URSPOT</span>
          </button>

          {/* Navigation: Home, Categories, Cities, My Bookings */}
          <nav className="flex items-center space-x-6 sm:space-x-8">
            {navItems.map((item) => {
              const isActive =
                activePage === item.id ||
                (item.id === 'cities' && (activePage === 'spot-detail' || activePage === 'booking')) ||
                (item.id === 'my-bookings' &&
                  (activePage === 'booking-detail' || activePage === 'review-service'));
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
        </div>

        {/* Right: Login, Sign Up & Profile Switcher */}
        <div className="flex items-center space-x-4">
          {!currentUser ? (
            <>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
              >
                Login
              </button>

              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
              >
                Sign Up
              </button>
            </>
          ) : (
            /* Profile Switcher Trigger */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                title={`${currentUser.fullName} (${currentUser.roleLabel || 'Customer'})`}
              >
                <User className="w-4 h-4 text-slate-700" />
              </button>

              {/* Profile & Switcher Dropdown */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileOpen(false)}
                    onPointerDown={() => setIsProfileOpen(false)}
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
          )}
        </div>
      </div>
    </header>
  );
};
