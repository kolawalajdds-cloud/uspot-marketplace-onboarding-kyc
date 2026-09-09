import React from 'react';
import { useDemo } from '../../context/DemoContext';

export const SpecialistPortal: React.FC = () => {
  const { currentUser, logout } = useDemo();

  const user = currentUser || {
    id: 'user-specialist',
    role: 'specialist' as const,
    roleLabel: 'Staff' as const,
    status: 'active' as const,
    email: 'morgan.blake@uspot.com',
    username: 'morgan_specialist',
    phone: '+1 (555) 876-5432',
    nickname: 'Morgan',
    fullName: 'Morgan Blake',
    referralCode: 'USPOT-OPS42',
    emailVerified: true,
    phoneVerified: true,
    timezone: 'UTC',
    memberSince: 'Aug 18, 2026',
    avatarInitials: 'M',
    department: 'Specialist Services',
    primaryServiceCategory:
      'hvac, electrical, carpentry, cleaning, painting, landscaping, moving, plumbing',
    yearsOfExperience: 10,
  };

  const initial = user.avatarInitials || user.fullName?.[0] || 'M';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-slate-900 font-sans">
      {/* Top Navigation Bar matching screenshot */}
      <header className="w-full bg-white border-b border-slate-200/90 px-6 sm:px-12 h-16 flex items-center justify-between">
        {/* Left: Brand + Dashboard link */}
        <div className="flex items-center gap-8 sm:gap-12">
          <span className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
            Juan-UrSpot Specialist
          </span>
          <span className="text-sm font-medium text-slate-900">
            Dashboard
          </span>
        </div>

        {/* Right: Email address + Red Logout Button */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="text-xs sm:text-sm text-slate-600 font-normal">
            {user.email || 'morgan.blake@uspot.com'}
          </span>
          <button
            type="button"
            onClick={logout}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area: Centered Profile / Dashboard Card */}
      <main className="flex-1 flex items-start justify-center pt-10 sm:pt-14 pb-16 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100">
          {/* Header section with Circular Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold shrink-0 select-none">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight">
                Welcome, {user.fullName || 'Morgan Blake'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                {user.email || 'morgan.blake@uspot.com'}
              </p>
            </div>
          </div>

          {/* 6 Info Boxes in a 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {/* Box 1: ROLE */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ROLE
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {user.role === 'specialist' ? 'specialist' : user.role}
              </span>
            </div>

            {/* Box 2: STATUS */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                STATUS
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {user.status || 'active'}
              </span>
            </div>

            {/* Box 3: USERNAME */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                USERNAME
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {user.username || 'morgan_specialist'}
              </span>
            </div>

            {/* Box 4: PHONE */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                PHONE
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {user.phone || '+1 (555) 876-5432'}
              </span>
            </div>

            {/* Box 5: PRIMARY SERVICE CATEGORY */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                PRIMARY SERVICE CATEGORY
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 block leading-snug">
                {user.primaryServiceCategory ||
                  'hvac, electrical, carpentry, cleaning, painting, landscaping, moving, plumbing'}
              </span>
            </div>

            {/* Box 6: YEARS OF EXPERIENCE */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                YEARS OF EXPERIENCE
              </span>
              <span className="text-sm font-semibold text-slate-900 block">
                {user.yearsOfExperience ?? 10}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
