import React from 'react';
import { DemoProvider, useDemo } from './context/DemoContext';
import { Navbar } from './components/Navbar';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { BusinessPortal } from './components/vendor/BusinessPortal';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { SpecialistPortal } from './components/specialist/SpecialistPortal';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const { currentUser } = useDemo();

  if (!currentUser) {
    return (
      <div className="h-full w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans overflow-y-auto">
        <Navbar />
        <div className="flex-1">
          <LoginView />
        </div>
      </div>
    );
  }

  // When logged in as business, render the full-featured BusinessPortal (with its own sidebar & topbar matching Image 1 & 2)
  if (currentUser.role === 'business') {
    return (
      <div className="h-full w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
        <BusinessPortal />
      </div>
    );
  }

  // When logged in as customer, render the dedicated CustomerPortal with Home, Categories, and Cities
  if (currentUser.role === 'customer') {
    return (
      <div className="h-full w-full bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-y-auto">
        <CustomerPortal />
      </div>
    );
  }

  // When logged in as staff / specialist, render the dedicated SpecialistPortal matching the image
  if (currentUser.role === 'specialist') {
    return (
      <div className="h-full w-full bg-[#FBFBFB] text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-y-auto">
        <SpecialistPortal />
      </div>
    );
  }

  // When logged in as super admin or admin, render dedicated SuperAdminDashboard layout
  return (
    <div className="h-full w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-hidden">
      <SuperAdminDashboard />
    </div>
  );
};

const AuthModalOverlay: React.FC = () => {
  const { state, setAuthModalOpen, currentUser } = useDemo();

  // If no user is logged in, the login page is already displayed on screen by default
  if (!currentUser || !state.isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 relative overflow-hidden animate-in zoom-in-95 duration-150">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>
        <LoginView isModal onClose={() => setAuthModalOpen(false)} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DemoProvider>
      <MainLayout />
      <AuthModalOverlay />
    </DemoProvider>
  );
}

