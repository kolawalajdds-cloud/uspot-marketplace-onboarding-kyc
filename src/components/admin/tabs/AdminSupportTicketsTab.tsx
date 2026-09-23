import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Building,
  User,
  Shield,
  RotateCcw,
  Check,
  Tag,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import { SupportTicket, TicketStatus, TicketPriority } from '../../../types';

export const AdminSupportTicketsTab: React.FC = () => {
  const { supportTickets, replyToSupportTicket, updateSupportTicketStatus, currentUser } = useDemo();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'worker' | 'business'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const filteredTickets = supportTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (roleFilter !== 'all' && t.userRole !== roleFilter) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.userName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId);

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTicketId) return;

    setIsReplying(true);
    replyToSupportTicket(selectedTicketId, replyContent.trim(), {
      senderId: currentUser?.id || 'user-superadmin',
      senderName: currentUser?.fullName || 'Super Admin Support',
      senderRole: 'super_admin',
    });

    setReplyContent('');
    setTimeout(() => setIsReplying(false), 300);
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase">Low</span>;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
            Closed
          </span>
        );
    }
  };

  // Detail View
  if (selectedTicket) {
    const isResolved = selectedTicket.status === 'resolved' || selectedTicket.status === 'closed';

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedTicketId(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Support Queue</span>
          </button>

          <div className="flex items-center gap-2">
            {isResolved ? (
              <button
                type="button"
                onClick={() => updateSupportTicketStatus(selectedTicket.id, 'in_progress')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Ticket</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => updateSupportTicketStatus(selectedTicket.id, 'resolved')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Resolve Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Ticket Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-black text-blue-600">{selectedTicket.ticketNumber}</span>
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {selectedTicket.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase">
                  Creator: {selectedTicket.userName} ({selectedTicket.userRole})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedTicket.title}</h2>
            </div>

            <div className="text-right text-xs text-slate-400">
              <div>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
              {selectedTicket.jobTitle && (
                <div className="font-bold text-slate-700 mt-1">Linked Job: {selectedTicket.jobTitle}</div>
              )}
            </div>
          </div>

          {/* Messages Thread */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Communication Thread ({selectedTicket.messages.length} messages)
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedTicket.messages.map((msg) => {
                const isAdmin = msg.senderRole === 'super_admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isAdmin
                          ? 'bg-slate-900 text-amber-400'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-xl space-y-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isAdmin ? 'Super Admin Support' : 'Specialist / Worker'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-3xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-slate-900 text-white rounded-tr-xs shadow-sm font-medium'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs font-normal'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Reply Box */}
            <form onSubmit={handleAdminReply} className="pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:border-blue-500 transition-colors">
                <textarea
                  rows={3}
                  required
                  placeholder="Type official Super Admin response to the worker..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 focus:outline-hidden resize-none font-medium leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-400 font-medium">
                    This reply will notify the worker immediately in their notification center.
                  </span>

                  <button
                    type="submit"
                    disabled={isReplying || !replyContent.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isReplying ? 'Sending...' : 'Send Official Response'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Master Queue View
  const openCount = supportTickets.filter((t) => t.status === 'open').length;
  const inProgressCount = supportTickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wide">
              Super Admin Support Center
            </span>
            {openCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {openCount} AWAITING ACTION
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Support & Resolution Inquiries Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized ticket resolution stream across Workers, Field Specialists, and Partner Merchants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            {supportTickets.length} Total Tickets
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Inquiries</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{supportTickets.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-blue-600">Open Tickets</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{openCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-amber-600">In Progress</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black uppercase text-emerald-600">Resolved</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-1">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="all">All User Roles</option>
            <option value="worker">Workers & Specialists</option>
            <option value="business">Business Merchants</option>
          </select>

          <input
            type="text"
            placeholder="Search tickets, IDs, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 sm:w-56 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
            <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No support inquiries found</h3>
            <p className="text-xs text-slate-400">All user tickets are currently addressed.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const lastMsg = ticket.messages[ticket.messages.length - 1];

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-blue-600">{ticket.ticketNumber}</span>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {ticket.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {ticket.userName} ({ticket.userRole})
                    </span>
                    {ticket.businessName && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {ticket.businessName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900">{ticket.title}</h3>

                  {lastMsg && (
                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      Latest: "{lastMsg.content}" &bull; by {lastMsg.senderName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center text-xs text-slate-400 shrink-0">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ticket.messages.length}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="text-[11px] font-mono">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-blue-600 font-bold hover:underline ml-1">
                    Manage Thread &rarr;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
