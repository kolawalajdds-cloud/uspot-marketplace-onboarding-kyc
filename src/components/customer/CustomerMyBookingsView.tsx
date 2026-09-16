import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Plus,
  Scissors,
  CreditCard,
  Banknote,
  Search,
  Filter,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Booking, BookingStatus } from '../../types';

interface CustomerMyBookingsViewProps {
  onBookNewService?: () => void;
}

export const CustomerMyBookingsView: React.FC<CustomerMyBookingsViewProps> = ({
  onBookNewService,
}) => {
  const { state, currentUser, bookings, cancelBooking, updateBookingStatus } = useDemo();
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'visited' | 'cancelled'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  // Filter bookings for current logged-in customer (or show all if guest/demo mode)
  const myBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (currentUser?.email && b.customer_email.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      if (currentUser?.id && b.customer_id === currentUser.id) {
        return true;
      }
      // Demo fallback: show sample bookings for user-customer
      return b.customer_id === 'user-customer' || b.customer_email.includes('alex');
    });
  }, [bookings, currentUser]);

  const filteredBookings = useMemo(() => {
    return myBookings.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchSearch =
        !searchFilter.trim() ||
        b.business_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        b.items.some((i) => i.service_name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        b.id.toLowerCase().includes(searchFilter.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [myBookings, statusFilter, searchFilter]);

  const confirmedCount = myBookings.filter((b) => b.status === 'confirmed').length;
  const visitedCount = myBookings.filter((b) => b.status === 'visited').length;
  const totalSpent = myBookings
    .filter((b) => b.payment_status === 'paid' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.total_amount, 0);

  const handleConfirmCancel = (id: string) => {
    cancelBooking(id);
    setCancellingBookingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Appointments & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage your service reservations, view multi-service breakdowns, and track status.
          </p>
        </div>

        {onBookNewService && (
          <button
            type="button"
            onClick={onBookNewService}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Service</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Upcoming Appointments
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{confirmedCount}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Visits
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{visitedCount}</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Visited
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Spend
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ${totalSpent.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">
              USD
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'confirmed', 'visited', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Bookings' : st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search venue or service..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-black font-medium"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">No appointments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `You have no ${statusFilter} appointments matching your search.`
              : 'You have not booked any services yet. Explore salons and venues to reserve your next appointment.'}
          </p>
          {onBookNewService && (
            <button
              type="button"
              onClick={onBookNewService}
              className="mt-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Browse Services
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'confirmed';
            const isVisited = b.status === 'visited';
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 transition-all hover:border-slate-300 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-black">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{b.business_name}</h3>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Booking ID: {b.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isVisited
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>

                    {/* Payment Method Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 font-mono ${
                        b.payment_status === 'paid'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.payment_method === 'credit_card' ? (
                        <CreditCard className="w-3 h-3" />
                      ) : (
                        <Banknote className="w-3 h-3" />
                      )}
                      <span>
                        {b.payment_method === 'credit_card'
                          ? 'NMI Card (Paid)'
                          : 'Pay at Salon (Unpaid)'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Date & Time */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scheduled Date & Time
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                      <CalendarIcon className="w-4 h-4 text-slate-500" />
                      <span>{b.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {b.scheduled_start_time} - {b.scheduled_end_time} ({b.total_duration_minutes}m)
                      </span>
                    </div>
                  </div>

                  {/* Multi-Service Itemized Breakdown */}
                  <div className="space-y-1.5 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Booked Services ({b.items.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {b.items.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold">{item.service_name}</span>
                          <span className="text-slate-400 text-[10px]">
                            ({item.duration_minutes}m • ${item.price_charged.toFixed(2)})
                          </span>
                        </span>
                      ))}
                    </div>
                    {b.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        Note: "{b.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer with Price & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Total Price:</span>
                    <span className="font-mono font-black text-slate-950 text-base">
                      ${b.total_amount.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancellingBookingId(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-600 font-bold transition-colors cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancellation Confirmation Inline Modal */}
                {cancellingBookingId === b.id && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Are you sure you want to cancel this appointment?</span>
                    </div>
                    <p className="text-[11px] text-rose-600">
                      Cancelling will release your reserved slot back to the salon schedule.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmCancel(b.id)}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        Yes, Cancel Appointment
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellingBookingId(null)}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Keep Appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
