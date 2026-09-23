import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Clock,
  MapPin,
  FileEdit,
  Camera,
  UploadCloud,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Check,
  User,
  Plus,
  X,
} from 'lucide-react';
import { WorkerJob } from '../../../types';

interface WorkerCheckInPageProps {
  workerId: string;
  selectedJob: WorkerJob | null;
  onNavigate: (page: string) => void;
  onJobUpdated: (job: WorkerJob) => void;
}

export const WorkerCheckInPage: React.FC<WorkerCheckInPageProps> = ({
  workerId,
  selectedJob,
  onNavigate,
  onJobUpdated,
}) => {
  // Live elapsed timer state (starts at 15 mins 35 seconds to match Image 3)
  const [elapsedSeconds, setElapsedSeconds] = useState(15 * 60 + 35);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)} : ${pad(mins)} : ${pad(secs)}`;
  };

  // Notes state matching Image 3
  const [notesList, setNotesList] = useState<
    { id: string; time: string; text: string }[]
  >([
    {
      id: 'n1',
      time: '10:45 AM',
      text: 'Perimeter check completed. No signs of forced entry. Rear gate sensor was slightly loose, tightened the bracket manually. Proceeding to internal thermal scan.',
    },
    {
      id: 'n2',
      time: '10:32 AM',
      text: 'Site arrival. Initial visual inspection of the driveway. All client vehicles accounted for as per registry.',
    },
  ]);

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const note = {
      id: `n-${Date.now()}`,
      time: timeStr,
      text: newNoteText.trim(),
    };
    setNotesList([note, ...notesList]);
    setNewNoteText('');
    setShowAddNoteModal(false);
    setToastMsg('Note recorded to live audit dispatch.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTakePhoto = () => {
    setToastMsg('Photo captured and uploaded with encrypted GPS stamp.');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (Exact match to Image 3)                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        {/* Left: Job Details title + Reference pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="text-sm font-extrabold text-gray-900 hover:underline cursor-pointer"
          >
            Job Details
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-mono font-bold text-gray-600">
            Ref: #{selectedJob?.id || 'USP-88219'}
          </span>
        </div>

        {/* Center: Search tasks bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-gray-100/90 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-all"
          />
        </div>

        {/* Right: Notifications, Help, User Avatar */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Bell className="w-4 h-4 text-gray-600 cursor-pointer" />
          <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            AS
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO ACTIVE SESSION BANNER & LIVE TIMER (Exact match to Image 3)       */}
      {/* ========================================================================= */}
      <div className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              ACTIVE SESSION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {selectedJob?.title || 'Estate Inspection & Security Audit'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Location: {selectedJob?.location || 'North Creek Sector, Plot 42-A'}
          </p>
        </div>

        {/* Live Stopwatch Timer Box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl px-7 py-4 text-center shrink-0 shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
            TIME ELAPSED
          </span>
          <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-widest mt-1 block">
            {formatTimer(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 4 QUICK ACTION BUTTONS (Exact match to Image 3)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Button 1: Add Note */}
        <button
          type="button"
          onClick={() => setShowAddNoteModal(true)}
          className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-800 cursor-pointer"
        >
          <FileEdit className="w-4 h-4 text-gray-700" />
          <span>Add Note</span>
        </button>

        {/* Button 2: Take Photo */}
        <button
          type="button"
          onClick={handleTakePhoto}
          className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-800 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-gray-700" />
          <span>Take Photo</span>
        </button>

        {/* Button 3: Upload Gallery */}
        <button
          type="button"
          onClick={handleTakePhoto}
          className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-800 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-gray-700" />
          <span>Upload Gallery</span>
        </button>

        {/* Button 4: Contact Customer */}
        <button
          type="button"
          onClick={() => alert(`Calling Customer at ${selectedJob?.customerPhone || '555-4567'}...`)}
          className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-800 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-gray-700" />
          <span>Contact Customer</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN 2-COLUMN SECTION (Exact match to Image 3)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (approx 7 cols): Recent Notes & Photo Gallery */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Recent Notes */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">Recent Notes</h3>
              <span className="text-xs text-gray-400 font-medium">
                {notesList.length} Entries recorded
              </span>
            </div>

            <div className="space-y-4">
              {notesList.map((n) => (
                <div key={n.id} className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                  <span className="text-[10px] font-mono font-bold text-gray-400 block mb-1.5">
                    {n.time}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Photo Gallery */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">Photo Gallery</h3>
              <button
                type="button"
                onClick={handleTakePhoto}
                className="text-xs font-bold text-black hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-200 border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                  alt="Perimeter gate"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="rounded-xl overflow-hidden aspect-video bg-gray-200 border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80"
                  alt="Sensor inspection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="rounded-xl overflow-hidden aspect-video bg-gray-200 border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80"
                  alt="Property interior"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (approx 5 cols): Special Instructions & Customer Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: SPECIAL INSTRUCTIONS */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              SPECIAL INSTRUCTIONS
            </span>

            {/* Instruction 1: ACCESS PROTOCOL */}
            <div className="bg-gray-50/80 border-l-4 border-black p-3.5 rounded-r-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black block mb-1">
                ACCESS PROTOCOL
              </span>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Use the service entrance only. DO NOT ring the main doorbell as there is a
                conference in progress.
              </p>
            </div>

            {/* Instruction 2: SPECIFIC TASK */}
            <div className="bg-gray-50/80 border-l-4 border-black p-3.5 rounded-r-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black block mb-1">
                SPECIFIC TASK
              </span>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Verify the status of the pool heating system. Ensure the filtration cycle is active.
              </p>
            </div>

            {/* Instruction 3: SAFETY ALERT */}
            <div className="bg-gray-50/80 border-l-4 border-black p-3.5 rounded-r-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black block mb-1">
                SAFETY ALERT
              </span>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Beware of the automatic sprinkler system scheduled for 11:30 AM in the North Garden.
              </p>
            </div>
          </div>

          {/* Card: Customer Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-4">
              Customer Information
            </span>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                AS
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  {selectedJob?.customerName || 'Alexandra Sterling'}
                </h4>
                <p className="text-xs text-gray-400 font-medium">VIP Member &bull; Since 2021</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Customer profile and property access authorized.')}
              className="w-full py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors cursor-pointer"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FLOATING BOTTOM STATUS BAR (Exact match to Image 3)                    */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 left-4 right-4 md:left-68 md:right-8 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GPS Tracking Active</span>
          </span>
          <span>&bull;</span>
          <span>All notes synced</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-black transition-colors cursor-pointer"
          >
            Cancel Session
          </button>

          <button
            type="button"
            onClick={() => onNavigate('check-out')}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>Complete Job</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Add Field Inspection Note</h3>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record observations, safety anomalies, completed sub-tasks..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="px-5 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
