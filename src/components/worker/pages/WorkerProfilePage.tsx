import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Camera,
  Upload,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Mail,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Landmark,
  ExternalLink,
  Calendar,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  Plus,
  ChevronDown,
  Award,
  Truck,
  Wrench,
  Smartphone,
} from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import { UserProfile } from '../../../types';

interface WorkerProfilePageProps {
  worker: UserProfile;
  onNavigate?: (page: string) => void;
}

type ProfileTab = 'personal' | 'documents' | 'bank' | 'availability' | 'deactivate';

interface CertificationItem {
  id: string;
  name: string;
  expiry: string;
  iconType: 'safety' | 'logistics' | 'machinery';
}

interface TimeOffItem {
  id: string;
  dates: string;
  label: string;
}

interface DaySchedule {
  day: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

export const WorkerProfilePage: React.FC<WorkerProfilePageProps> = ({ worker, onNavigate }) => {
  const { currentUser, updateUserProfile, updateUserById } = useDemo();
  const activeWorker = (currentUser && currentUser.id === worker.id ? currentUser : worker) || worker;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // =========================================================================
  // TAB 1: PERSONAL INFO STATE
  // =========================================================================
  const nameParts = (activeWorker.fullName || 'Marcus Miller').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || 'Marcus');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || 'Miller');
  const [username, setUsername] = useState('@mmiller_pro');
  const [nickname, setNickname] = useState(activeWorker.nickname || 'Marc');
  const [phoneNumber, setPhoneNumber] = useState(activeWorker.phone || '+1 (555) 123-4567');
  const [timezone, setTimezone] = useState(activeWorker.timezone || 'Pacific Standard Time (PST)');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  );

  // =========================================================================
  // TAB 2: LICENSE & DOCUMENTS STATE
  // =========================================================================
  const [publicLicense, setPublicLicense] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState('XXXXXXXX-4829');
  const [showLicenseNumber, setShowLicenseNumber] = useState(false);
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { id: 'cert-1', name: 'OSHA Safety Cert', expiry: 'Exp: Oct 2025', iconType: 'safety' },
    { id: 'cert-2', name: 'Advanced Logistics', expiry: 'Exp: Mar 2026', iconType: 'logistics' },
    { id: 'cert-3', name: 'Heavy Machinery Op', expiry: 'Exp: Dec 2024', iconType: 'machinery' },
  ]);
  const [showUploadCertModal, setShowUploadCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertExpiry, setNewCertExpiry] = useState('');

  // =========================================================================
  // TAB 3: BANK INFORMATION STATE
  // =========================================================================
  const [bankName, setBankName] = useState('Metropolitan Finance Corp');
  const [accountTitle, setAccountTitle] = useState('ALEX RIVERA');
  const [accountNumber, setAccountNumber] = useState('882910293041');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [iban, setIban] = useState('US09 METR 0001 0293 8841 22');
  const [swiftBic, setSwiftBic] = useState('METRUS33XXX');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [branchCode, setBranchCode] = useState('4412');
  const [isDefaultPayout, setIsDefaultPayout] = useState(true);

  // =========================================================================
  // TAB 4: AVAILABILITY STATE
  // =========================================================================
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { day: 'Monday', active: true, startTime: '08:00 AM', endTime: '05:00 PM' },
    { day: 'Tuesday', active: true, startTime: '08:00 AM', endTime: '05:00 PM' },
    { day: 'Wednesday', active: true, startTime: '08:00 AM', endTime: '05:00 PM' },
    { day: 'Thursday', active: true, startTime: '08:00 AM', endTime: '05:00 PM' },
    { day: 'Friday', active: true, startTime: '08:00 AM', endTime: '03:00 PM' },
    { day: 'Saturday', active: false, startTime: '09:00 AM', endTime: '12:00 PM' },
    { day: 'Sunday', active: false, startTime: '09:00 AM', endTime: '12:00 PM' },
  ]);
  const [timeOffList, setTimeOffList] = useState<TimeOffItem[]>([
    { id: 'to-1', dates: 'Dec 24 - Dec 26', label: 'HOLIDAY BREAK' },
    { id: 'to-2', dates: 'Jan 12, 2024', label: 'PERSONAL APPOINTMENT' },
  ]);
  const [showAddTimeOffModal, setShowAddTimeOffModal] = useState(false);
  const [newTimeOffDates, setNewTimeOffDates] = useState('');
  const [newTimeOffLabel, setNewTimeOffLabel] = useState('');

  // =========================================================================
  // TAB 5: DEACTIVATE STATE
  // =========================================================================
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handlers
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    const updates: Partial<UserProfile> = {
      fullName: fullName,
      nickname,
      phone: phoneNumber,
      timezone,
    };
    updateUserProfile(updates);
    if (activeWorker.id) {
      updateUserById(activeWorker.id, updates);
    }
    showToast('Personal info saved successfully!');
  };

  const handleSaveLicenseDocs = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('License and document settings saved successfully!');
  };

  const handleSaveBankInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Bank information and settlement details updated!');
  };

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Weekly schedule & availability saved and synchronized!');
  };

  const showToast = (message: string) => {
    setFeedback({ type: 'success', message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleDay = (index: number) => {
    setWeeklySchedule((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, active: !item.active } : item))
    );
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteCert = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeleteTimeOff = (id: string) => {
    setTimeOffList((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim()) return;
    setCertifications((prev) => [
      ...prev,
      {
        id: `cert-${Date.now()}`,
        name: newCertName.trim(),
        expiry: newCertExpiry.trim() || 'Exp: Ongoing',
        iconType: 'safety',
      },
    ]);
    setNewCertName('');
    setNewCertExpiry('');
    setShowUploadCertModal(false);
    showToast('Certification uploaded and verified!');
  };

  const handleAddTimeOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeOffDates.trim()) return;
    setTimeOffList((prev) => [
      ...prev,
      {
        id: `to-${Date.now()}`,
        dates: newTimeOffDates.trim(),
        label: (newTimeOffLabel.trim() || 'LEAVE').toUpperCase(),
      },
    ]);
    setNewTimeOffDates('');
    setNewTimeOffLabel('');
    setShowAddTimeOffModal(false);
    showToast('Time off schedule added!');
  };

  const getCertIcon = (type: CertificationItem['iconType']) => {
    switch (type) {
      case 'safety':
        return <Award className="w-4 h-4 text-gray-700" />;
      case 'logistics':
        return <ShieldCheck className="w-4 h-4 text-gray-700" />;
      case 'machinery':
        return <Wrench className="w-4 h-4 text-gray-700" />;
    }
  };

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR & SEARCH (Exact match across all images)                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100/90 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('/worker/notifications')}
              className="relative p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('/worker/security')}
              className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-gray-900">
                {activeWorker.fullName || 'Marcus Miller'}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold">
                {activeWorker.roleLabel || 'Pro Worker'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PAGE HEADER & SUBTITLE                                                 */}
      {/* ========================================================================= */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Worker Profile
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {activeTab === 'personal' && 'Manage your personal information, credentials, and account preferences.'}
          {activeTab === 'documents' && 'Manage your licenses, certifications, and documents in one secure place.'}
          {activeTab === 'bank' && 'Manage your professional identity and financial details.'}
          {activeTab === 'availability' && 'Manage your professional credentials, preferences, and availability schedule.'}
          {activeTab === 'deactivate' && 'Manage your account settings, compliance documents, and platform presence.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL TAB NAVIGATION (5 Tabs matching Images)                     */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`pb-3 text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'personal'
                ? 'text-gray-900 border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-3 text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'documents'
                ? 'text-gray-900 border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            License &amp; Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`pb-3 text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'bank'
                ? 'text-gray-900 border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Bank Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('availability')}
            className={`pb-3 text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'availability'
                ? 'text-gray-900 border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Availability
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deactivate')}
            className={`pb-3 text-xs font-bold whitespace-nowrap transition-all relative cursor-pointer ${
              activeTab === 'deactivate'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-rose-600/80 hover:text-rose-600'
            }`}
          >
            Deactivate
          </button>
        </div>
      </div>

      {/* Global Toast Message */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PERSONAL INFO CONTENT (Image 1)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Left Card: Avatar & Upload */}
            <div className="w-full md:w-72 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-center flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={avatarUrl}
                    alt="Marcus Miller"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const samplePics = [
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
                    ];
                    const next = samplePics[(samplePics.indexOf(avatarUrl) + 1) % samplePics.length];
                    setAvatarUrl(next);
                    showToast('Profile photo updated successfully!');
                  }}
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center absolute bottom-0 right-0 ring-2 ring-white shadow-xs cursor-pointer hover:bg-neutral-800 transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base font-extrabold text-gray-900 mt-4">
                {firstName} {lastName}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Joined December 2023</p>

              <button
                type="button"
                onClick={() => {
                  const samplePics = [
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                  ];
                  setAvatarUrl(samplePics[0]);
                  showToast('Uploaded new photo successfully.');
                }}
                className="w-full mt-5 py-2.5 px-4 rounded-lg border border-gray-200 hover:border-black text-xs font-bold text-gray-900 transition-colors cursor-pointer"
              >
                Upload New Photo
              </button>
              <span className="text-[10px] text-gray-400 mt-2 block">
                JPG or PNG. Max size 5MB.
              </span>
            </div>

            {/* Right Card: Form Details */}
            <form
              onSubmit={handleSavePersonalInfo}
              className="flex-1 bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    NICKNAME
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    TIMEZONE
                  </label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors appearance-none pr-8 cursor-pointer"
                    >
                      <option value="Pacific Standard Time (PST)">Pacific Standard Time (PST)</option>
                      <option value="Eastern Standard Time (EST)">Eastern Standard Time (EST)</option>
                      <option value="Central Standard Time (CST)">Central Standard Time (CST)</option>
                      <option value="Mountain Standard Time (MST)">Mountain Standard Time (MST)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName('Marcus');
                    setLastName('Miller');
                    setUsername('@mmiller_pro');
                    setNickname('Marc');
                    setPhoneNumber('+1 (555) 123-4567');
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Bottom 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900">
                  Identity Verified
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Your background check was successfully completed on Jan 12, 2024.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900">
                  2FA Enabled
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Your account is protected with two-factor authentication via SMS.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-gray-900">
                  m.miller@pro.com
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Primary contact email used for all job-related notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LICENSE & DOCUMENTS CONTENT (Image 2)                              */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <form onSubmit={handleSaveLicenseDocs} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Document Verification Status */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    DOCUMENT VERIFICATION STATUS
                  </span>
                  <div className="text-base font-extrabold text-gray-900 mt-1">
                    Trust Score: Verified
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>

              {/* Card 2: Professional License */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      Professional License
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Manage your primary working credentials and public visibility.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Public License</span>
                    <button
                      type="button"
                      onClick={() => setPublicLicense(!publicLicense)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        publicLicense ? 'bg-black' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          publicLicense ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    LICENSE NUMBER
                  </label>
                  <div className="relative">
                    <input
                      type={showLicenseNumber ? 'text' : 'password'}
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLicenseNumber(!showLicenseNumber)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showLicenseNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Uploaded License File Box */}
                <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">license_v2_final.pdf</div>
                      <div className="text-[11px] text-gray-400">Uploaded 12 Oct 2023</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Downloading license_v2_final.pdf')}
                      className="p-1.5 text-gray-400 hover:text-black cursor-pointer ml-1"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('New license document uploaded.')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Government Identification */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900">
                  Government Identification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NIC File */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      NIC FILE (NATIONAL ID)
                    </label>
                    <div className="relative rounded-xl overflow-hidden h-36 bg-linear-to-br from-slate-900 via-neutral-900 to-black flex items-center justify-center border border-gray-200">
                      <div className="text-center p-3 text-white">
                        <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-xs font-bold block">Verified National ID</span>
                        <span className="text-[10px] text-gray-400">ID-8921-X99</span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => showToast('Re-uploading ID card...')}
                          className="px-3 py-1.5 rounded-md bg-white text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert('Downloading NIC Card file')}
                          className="p-1.5 rounded-md bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Government ID Passport/DL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      GOVERNMENT ID (PASSPORT/DL)
                    </label>
                    <div
                      onClick={() => showToast('Passport / Driver License uploaded.')}
                      className="rounded-xl border-2 border-dashed border-gray-200 hover:border-black transition-colors h-36 flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-gray-50/50"
                    >
                      <Camera className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-900">Upload Government ID</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        JPG, PNG or PDF (Max 5MB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLicenseNumber('XXXXXXXX-4829');
                    setPublicLicense(true);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Certifications */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm text-gray-900">Certifications</h3>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase tracking-wider">
                    {certifications.length} UPLOADED
                  </span>
                </div>

                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                          {getCertIcon(cert.iconType)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900">{cert.name}</div>
                          <div className="text-[11px] text-gray-400">{cert.expiry}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCert(cert.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUploadCertModal(true)}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:border-black text-xs font-bold text-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>+ Upload Certifications</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BANK INFORMATION CONTENT (Image 3)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <form onSubmit={handleSaveBankInfo} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Settlement Details */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">
                  Settlement Details
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
                  Primary Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Account Number
                  </label>
                  <div className="relative">
                    <input
                      type={showAccountNumber ? 'text' : 'password'}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Swift Code (BIC)
                  </label>
                  <input
                    type="text"
                    value={swiftBic}
                    onChange={(e) => setSwiftBic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono font-medium text-gray-900 focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="defaultPayout"
                    checked={isDefaultPayout}
                    onChange={(e) => setIsDefaultPayout(e.target.checked)}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <label htmlFor="defaultPayout" className="text-xs font-bold text-gray-900 cursor-pointer">
                    Set as default payout method
                  </label>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setBankName('Metropolitan Finance Corp');
                    setAccountTitle('ALEX RIVERA');
                    setAccountNumber('882910293041');
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Security Note & Visual Card */}
            <div className="lg:col-span-4 space-y-6">
              {/* Security Note */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 mb-3">
                  <Landmark className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  Security Note
                </h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Your bank information is encrypted and stored securely. Payouts are processed every Monday for the preceding week&apos;s completed contracts.
                </p>
                <a
                  href="#payouts"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('/worker/earnings');
                  }}
                  className="font-bold text-xs text-gray-900 hover:underline inline-flex items-center gap-1 mt-4"
                >
                  <span>Learn about payouts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Visual Card (Verified for direct deposit settlement) */}
              <div className="rounded-2xl p-6 bg-linear-to-br from-neutral-900 via-zinc-900 to-black text-white shadow-md relative overflow-hidden flex flex-col justify-end min-h-48 border border-neutral-800">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-medium text-gray-200">
                    Verified for direct deposit settlement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AVAILABILITY CONTENT (Image 4)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'availability' && (
        <form onSubmit={handleSaveAvailability} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Weekly Schedule */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Weekly Schedule
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Define your recurring weekly working hours.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE SYNC</span>
                </span>
              </div>

              {/* Days Table */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-gray-400 pb-1">
                  <div className="col-span-3">DAY</div>
                  <div className="col-span-3">STATUS</div>
                  <div className="col-span-3">START TIME</div>
                  <div className="col-span-3">END TIME</div>
                </div>

                {weeklySchedule.map((sched, index) => (
                  <div
                    key={sched.day}
                    className="grid grid-cols-12 items-center py-2.5 border-t border-gray-100 text-xs"
                  >
                    <div className="col-span-3 font-bold text-gray-900">
                      {sched.day}
                    </div>

                    <div className="col-span-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(index)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          sched.active ? 'bg-black' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                            sched.active ? 'left-4.5' : 'left-1'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold ${sched.active ? 'text-gray-900' : 'text-gray-400'}`}>
                        {sched.active ? 'Active' : 'Off'}
                      </span>
                    </div>

                    <div className="col-span-3 pr-2">
                      <input
                        type="text"
                        disabled={!sched.active}
                        value={sched.startTime}
                        onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium ${
                          sched.active
                            ? 'bg-white border-gray-200 text-gray-900'
                            : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        disabled={!sched.active}
                        value={sched.endTime}
                        onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium ${
                          sched.active
                            ? 'bg-white border-gray-200 text-gray-900'
                            : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action */}
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Save Availability
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Time Off, Capacity, Pro Tip */}
            <div className="lg:col-span-4 space-y-5">
              {/* Time Off Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-gray-900">Time Off</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddTimeOffModal(true)}
                    className="text-xs font-bold text-gray-900 hover:underline cursor-pointer"
                  >
                    + Add Date
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Set specific dates when you are unavailable for jobs.
                </p>

                <div className="space-y-2.5">
                  {timeOffList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-bold text-xs text-gray-900">{item.dates}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            {item.label}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTimeOff(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Capacity (Black Card) */}
              <div className="bg-black text-white rounded-2xl p-6 shadow-md space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  CURRENT CAPACITY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">85%</span>
                  <span className="text-xs font-semibold text-gray-400">Utilized</span>
                </div>

                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-2 rounded-full w-[85%]" />
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  You are reaching peak capacity for the upcoming week. Consider adjusting your hours or adding time-off dates.
                </p>
              </div>

              {/* Pro Tip Card */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-extrabold text-gray-900">Pro Tip</h5>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Workers with at least 40 hours of weekly availability receive 2x more job invites from high-priority clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DEACTIVATE CONTENT (Image 5)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'deactivate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Warning & Actions */}
            <div className="lg:col-span-8 space-y-6">
              {/* High-security Alert Banner */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-sm text-rose-900">
                    Account Termination &amp; Deactivation
                  </h4>
                  <p className="text-rose-700 mt-1.5 leading-relaxed">
                    You are entering the high-security account management zone. Actions taken here are significant and may impact your ability to accept future work assignments on the URSPOT platform. Please read each option carefully.
                  </p>
                </div>
              </div>

              {/* Section 1: Temporarily Deactivate Account */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900">
                  Temporarily Deactivate Account
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Deactivating your account will hide your profile from all marketplace searches and prevent new job offers. Your historical data, earned rewards, and verified licenses will be preserved. You can reactivate at any time by logging back in.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateConfirm(true)}
                    className="px-5 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-wider transition-colors cursor-pointer self-start"
                  >
                    DEACTIVATE ACCOUNT
                  </button>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>URSPOT maintains a 12-month data retention policy for compliance.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-6" />

              {/* Section 2: Permanent Account Deletion */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-rose-600">
                  Permanent Account Deletion
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This action is permanent and cannot be undone. All your work history, performance metrics, and pending reward balances will be purged from our active systems.
                </p>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2.5 rounded-lg border-2 border-rose-500 hover:bg-rose-50 text-rose-600 text-xs font-bold tracking-wider transition-colors cursor-pointer"
                >
                  DELETE ACCOUNT PERMANENTLY
                </button>
              </div>
            </div>

            {/* Right 4 Cols: What Happens Next & Need Help? */}
            <div className="lg:col-span-4 space-y-6">
              {/* What Happens Next Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-900">
                  WHAT HAPPENS NEXT?
                </h4>

                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>Active contracts will be automatically flagged for completion review.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>Pending payments will be processed to your linked bank account within 3-5 business days.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>You will receive a confirmation email with a summary of your final account status.</span>
                  </div>
                </div>
              </div>

              {/* Need Help? Pitch-Black Card */}
              <div className="bg-black text-white rounded-2xl p-6 shadow-md space-y-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">
                  Need Help?
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  If you&apos;re having trouble with a specific job or client, our support team can help resolve issues without deactivating your profile.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('/worker/tickets')}
                  className="pt-2 font-bold text-xs text-white uppercase tracking-wider hover:underline block cursor-pointer"
                >
                  CONTACT SUPPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD CERTIFICATION                                               */}
      {/* ========================================================================= */}
      {showUploadCertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">
                Upload New Certification
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadCertModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Certification Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Electrician License"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Expiry Date / Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exp: Dec 2026"
                  value={newCertExpiry}
                  onChange={(e) => setNewCertExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-black transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-gray-700 block">
                  Select Certificate File
                </span>
                <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadCertModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800"
                >
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD TIME OFF                                                       */}
      {/* ========================================================================= */}
      {showAddTimeOffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">
                Add Time Off Dates
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTimeOffModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTimeOffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dates Range
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Feb 14 - Feb 16"
                  value={newTimeOffDates}
                  onChange={(e) => setNewTimeOffDates(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAMILY EVENT"
                  value={newTimeOffLabel}
                  onChange={(e) => setNewTimeOffLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTimeOffModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800"
                >
                  Add Time Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DEACTIVATE                                                 */}
      {/* ========================================================================= */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900">
              Confirm Account Deactivation
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Your profile will be temporarily hidden from client searches. You can reactivate anytime.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeactivateConfirm(false);
                  showToast('Your account has been deactivated. Logging out...');
                  setTimeout(() => onNavigate?.('/login'), 1500);
                }}
                className="w-full py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Deactivate
              </button>
              <button
                type="button"
                onClick={() => setShowDeactivateConfirm(false)}
                className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE PERMANENTLY                                         */}
      {/* ========================================================================= */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-rose-600">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              This action is permanent and cannot be undone. All earnings, history, and documents will be erased.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  showToast('Your account was permanently deleted. Goodbye.');
                  setTimeout(() => onNavigate?.('/login'), 1500);
                }}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete My Account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
