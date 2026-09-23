import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Plus,
  ArrowLeft,
  Lock,
  Printer,
  Paperclip,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import { UserProfile } from '../../../types';

interface WorkerSupportTicketsPageProps {
  worker: UserProfile;
  onNavigate?: (page: string) => void;
}

interface TicketMessage {
  id: string;
  sender: 'worker' | 'agent';
  senderName: string;
  senderRole: string;
  timestamp: string;
  text: string;
}

interface TicketItem {
  id: string;
  ref: string;
  date: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'IN PROGRESS' | 'CLOSED' | 'RESOLVED';
  messages: TicketMessage[];
}

export const WorkerSupportTicketsPage: React.FC<WorkerSupportTicketsPageProps> = ({
  worker,
  onNavigate,
}) => {
  const { currentUser } = useDemo();
  const activeWorker = (currentUser && currentUser.id === worker.id ? currentUser : worker) || worker;

  // Selected ticket for detailed thread view (Image 2)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Active filter tab (Image 1)
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reply form state (Image 2)
  const [replyText, setReplyText] = useState('');

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Payment Issue');
  const [newDescription, setNewDescription] = useState('');

  // Seed tickets matching Image 1 & Image 2
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'tkt-1',
      ref: 'TKT-901',
      date: 'Jun 15, 2026',
      category: 'Payment Issue',
      subject: 'Missing payout for Job #REF-123',
      status: 'OPEN',
      messages: [
        {
          id: 'm-1',
          sender: 'worker',
          senderName: 'Marcus Sterling (You)',
          senderRole: 'Worker',
          timestamp: 'Today, 09:12 AM',
          text: "Hello, I completed Job #REF-123 yesterday afternoon but the payout hasn't reflected in my wallet yet. Usually it's instant for confirmed tasks. Could you check the status of the settlement?",
        },
        {
          id: 'm-2',
          sender: 'agent',
          senderName: 'Jane Doe (Support)',
          senderRole: 'Support Specialist',
          timestamp: 'Today, 10:45 AM',
          text: "Hi Marcus, thanks for reaching out. I've looked into Job #REF-123. It appears the client has requested a final inspection report which was missing from the upload. Once that's verified, the payout will be triggered automatically.",
        },
        {
          id: 'm-3',
          sender: 'worker',
          senderName: 'Marcus Sterling (You)',
          senderRole: 'Worker',
          timestamp: 'Today, 11:02 AM',
          text: "Ah, I see. I've just uploaded the inspection report to the job portal now. Could you please refresh the status from your end?",
        },
      ],
    },
    {
      id: 'tkt-2',
      ref: 'TKT-885',
      date: 'Jun 10, 2026',
      category: 'App Bug',
      subject: 'Cannot upload photos',
      status: 'IN PROGRESS',
      messages: [
        {
          id: 'm-21',
          sender: 'worker',
          senderName: 'Marcus Sterling (You)',
          senderRole: 'Worker',
          timestamp: 'Jun 10, 02:15 PM',
          text: 'The mobile app keeps crashing whenever I try to upload more than 3 check-in photos on high resolution.',
        },
      ],
    },
    {
      id: 'tkt-3',
      ref: 'TKT-842',
      date: 'Jun 05, 2026',
      category: 'Account',
      subject: 'Updating bank details',
      status: 'CLOSED',
      messages: [
        {
          id: 'm-31',
          sender: 'worker',
          senderName: 'Marcus Sterling (You)',
          senderRole: 'Worker',
          timestamp: 'Jun 05, 11:00 AM',
          text: 'I recently switched to Chase Bank and need assistance updating my settlement routing number.',
        },
      ],
    },
    {
      id: 'tkt-4',
      ref: 'TKT-810',
      date: 'May 28, 2026',
      category: 'Policy',
      subject: 'Insurance coverage clarification',
      status: 'RESOLVED',
      messages: [
        {
          id: 'm-41',
          sender: 'worker',
          senderName: 'Marcus Sterling (You)',
          senderRole: 'Worker',
          timestamp: 'May 28, 04:30 PM',
          text: 'Could you confirm whether equipment accidental loss is covered under the primary platform liability policy?',
        },
      ],
    },
  ]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Filtering tickets
  const filteredTickets = tickets.filter((ticket) => {
    let matchesTab = true;
    if (activeTab === 'Open') matchesTab = ticket.status === 'OPEN';
    else if (activeTab === 'In Progress') matchesTab = ticket.status === 'IN PROGRESS';
    else if (activeTab === 'Resolved') matchesTab = ticket.status === 'RESOLVED';
    else if (activeTab === 'Closed') matchesTab = ticket.status === 'CLOSED';

    const matchesSearch =
      ticket.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    const newMessage: TicketMessage = {
      id: `m-${Date.now()}`,
      sender: 'worker',
      senderName: `${activeWorker.fullName || 'Marcus Sterling'} (You)`,
      senderRole: 'Worker',
      timestamp: 'Just now',
      text: replyText.trim(),
    };

    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, messages: [...t.messages, newMessage] } : t))
    );
    setReplyText('');
  };

  const handleCloseTicket = () => {
    if (!selectedTicketId) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, status: 'CLOSED' } : t))
    );
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const newTicket: TicketItem = {
      id: `tkt-${Date.now()}`,
      ref: `TKT-${Math.floor(902 + Math.random() * 90)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      category: newCategory,
      subject: newSubject.trim(),
      status: 'OPEN',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'worker',
          senderName: `${activeWorker.fullName || 'Marcus Sterling'} (You)`,
          senderRole: 'Worker',
          timestamp: 'Just now',
          text: newDescription.trim(),
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setSelectedTicketId(newTicket.id);
    setShowCreateModal(false);
    setNewSubject('');
    setNewDescription('');
  };

  const getStatusBadge = (status: TicketItem['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] tracking-wider">
            OPEN
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wider">
            IN PROGRESS
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] tracking-wider">
            CLOSED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-bold text-[10px] tracking-wider">
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-14 text-gray-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR (Exact match across Images 1 & 2)                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={selectedTicketId ? 'Search for tickets, agents...' : 'Search tickets, reference number...'}
            className="w-full pl-9 pr-4 py-2 bg-gray-100/90 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-black transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-4">
          {selectedTicketId && (
            <span className="text-xs font-bold text-gray-800 hidden sm:inline-block">
              Support Desk
            </span>
          )}

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
                {activeWorker.fullName || 'Alex Rivera'}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold">
                Senior Contractor
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                alt="Alex Rivera"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TICKETS LIST PAGE (Image 1)                                       */}
      {/* ========================================================================= */}
      {!selectedTicketId && (
        <div className="space-y-6">
          {/* Header & Create Ticket Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Support Tickets
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage your inquiries and track issue resolutions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center gap-6">
              {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === tab
                      ? 'text-gray-900 border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                TOTAL TICKETS
              </span>
              <div className="text-3xl font-black text-gray-900 mt-3">12</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                AWAITING ACTION
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-black text-rose-600">1</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px]">
                  New
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                AVERAGE RESPONSE
              </span>
              <div className="text-3xl font-black text-gray-900 mt-3">2.4h</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                RESOLUTION RATE
              </span>
              <div className="text-3xl font-black text-gray-900 mt-3">94%</div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-6">REF #</th>
                    <th className="py-4 px-6">CATEGORY</th>
                    <th className="py-4 px-6">SUBJECT</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                        No support tickets found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-6 text-gray-900 font-medium whitespace-nowrap">
                          {ticket.date}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                          {ticket.ref}
                        </td>
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                          {ticket.category}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 max-w-xs truncate">
                          {ticket.subject}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className="px-3.5 py-1.5 rounded-lg border border-gray-200 hover:border-black text-gray-800 text-xs font-bold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Showing 4 of 12 tickets
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer text-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Card: Need immediate help? (Pitch-Black Card) */}
          <div className="bg-black text-white rounded-2xl p-7 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <h3 className="font-extrabold text-lg text-white">
                Need immediate help?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Browse our comprehensive help guides and tutorials for contractors.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Opening Knowledge Base & Help Guides')}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-gray-100 text-black text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              Visit Help Center
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TICKET CONVERSATION VIEW (Image 2)                                */}
      {/* ========================================================================= */}
      {selectedTicketId && selectedTicket && (
        <div className="space-y-6">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setSelectedTicketId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tickets</span>
          </button>

          {/* Ticket Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedTicket.ref}
                </span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {selectedTicket.subject}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Category: <span className="font-semibold text-gray-700">{selectedTicket.category}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCloseTicket}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 hover:border-black text-gray-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Close Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Conversation Thread Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="space-y-6">
              {selectedTicket.messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  {/* Sender & Timestamp */}
                  {msg.sender === 'worker' ? (
                    <div className="text-right text-[11px] text-gray-400 font-medium pr-1">
                      {msg.senderName} • {msg.timestamp}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium pl-1">
                      <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[9px] flex items-center justify-center">
                        JD
                      </div>
                      <span>{msg.senderName} • {msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-4 text-xs leading-relaxed max-w-xl ${
                      msg.sender === 'worker'
                        ? 'bg-black text-white rounded-2xl rounded-tr-xs ml-auto shadow-xs'
                        : 'bg-gray-100/90 text-gray-900 rounded-2xl rounded-tl-xs mr-auto'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box Container */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-gray-100 space-y-2">
              <div className="border border-gray-200 rounded-2xl p-4 shadow-2xs focus-within:border-black transition-colors bg-white">
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full text-xs text-gray-900 placeholder-gray-400 bg-transparent focus:outline-hidden resize-none"
                />

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      type="button"
                      onClick={() => alert('Select attachment')}
                      className="p-1 hover:text-black cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      SUPPORTS MARKDOWN FORMATTING
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="text-right text-[10px] text-gray-400 pr-1">
                Last updated: 2 mins ago
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE TICKET                                                      */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your inquiry"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black"
                >
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="App Bug">App Bug</option>
                  <option value="Account">Account</option>
                  <option value="Policy">Policy</option>
                  <option value="Job & Shift">Job &amp; Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all relevant details, job IDs, or error messages..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-hidden focus:border-black resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
