import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Eye,
  RotateCcw,
  Download,
  Building2,
  X,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Booking, BookingStatus } from '../../types';

interface CustomerMyBookingsViewProps {
  onBookNewService?: () => void;
  onViewBookingDetail?: (bookingId: string) => void;
  onReviewBookingService?: (bookingId: string) => void;
}

export const CustomerMyBookingsView: React.FC<CustomerMyBookingsViewProps> = ({
  onBookNewService,
  onViewBookingDetail,
  onReviewBookingService,
}) => {
  const { bookings, currentUser, cancelBooking, rescheduleBooking } = useDemo();

  // Filters state
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'all' | 'confirmed' | 'visited' | 'cancelled'>('all');

  // Interactive 3-dots action menu
  const [activeMenuBookingId, setActiveMenuBookingId] = useState<string | null>(null);

  // Modals state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('10:00 AM');
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter bookings for current user or sample demo customer
  const customerBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (currentUser?.email && b.customer_email.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      if (currentUser?.id && b.customer_id === currentUser.id) {
        return true;
      }
      return (
        b.customer_id === 'user-customer' ||
        b.customer_email.includes('alex') ||
        b.reference_number?.startsWith('#LX-') ||
        b.reference_number?.startsWith('#USR-')
      );
    });
  }, [bookings, currentUser]);

  // Tab counts
  const totalCount = customerBookings.length;
  const confirmedCount = customerBookings.filter((b) => b.status === 'confirmed').length;
  const visitedCount = customerBookings.filter((b) => b.status === 'visited').length;
  const cancelledCount = customerBookings.filter((b) => b.status === 'cancelled').length;

  // Filter logic
  const filteredBookings = useMemo(() => {
    return customerBookings.filter((b) => {
      // Tab filter
      if (statusTab !== 'all' && b.status !== statusTab) {
        return false;
      }

      // From date filter
      const bDate = b.scheduled_date || b.booking_date;
      if (fromDate && bDate < fromDate) {
        return false;
      }

      // To date filter
      if (toDate && bDate > toDate) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const refMatch = (b.reference_number || b.id).toLowerCase().includes(query);
        const bizMatch = b.business_name.toLowerCase().includes(query);
        const serviceMatch = b.items.some((i) => i.service_name.toLowerCase().includes(query));
        if (!refMatch && !bizMatch && !serviceMatch) {
          return false;
        }
      }

      return true;
    });
  }, [customerBookings, statusTab, fromDate, toDate, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setStatusTab('all');
    setCurrentPage(1);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    cancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalBooking || !newRescheduleDate) return;
    rescheduleBooking(rescheduleModalBooking.id, newRescheduleDate, newRescheduleTime);
    setRescheduleModalBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/70 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track, manage, and review your appointments across all service providers.
            </p>
          </div>

          {onBookNewService && (
            <button
              onClick={onBookNewService}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Service</span>
            </button>
          )}
        </div>

        {/* Filter Card (Image 2 Style) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* From Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-800 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-800 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by business, service, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Clear Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Status Tabs (Image 2 Style) */}
        <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-px">
          {[
            { id: 'all', label: 'All Bookings', count: totalCount },
            { id: 'confirmed', label: 'Confirmed', count: confirmedCount },
            { id: 'visited', label: 'Visited', count: visitedCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-gray-900 text-gray-900 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings Table (Image 2 Style) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {paginatedBookings.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No bookings found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                No appointments match your active filter criteria. Try clearing the search or date
                range.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-6">DATE & TIME</th>
                    <th className="py-3.5 px-6">REFERENCE #</th>
                    <th className="py-3.5 px-6">BUSINESS</th>
                    <th className="py-3.5 px-6">ORDER STATUS</th>
                    <th className="py-3.5 px-6">PAYMENT STATUS</th>
                    <th className="py-3.5 px-6 text-right">AMOUNT</th>
                    <th className="py-3.5 px-4 text-center w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedBookings.map((booking) => {
                    const isVisited = booking.status === 'visited';
                    const isConfirmed = booking.status === 'confirmed';
                    const isCancelled = booking.status === 'cancelled';
                    const isPaid = booking.payment_status === 'paid';
                    const isRefunded = booking.payment_status === 'refunded';

                    const formattedDate = booking.scheduled_date
                      ? new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Oct 24, 2023';

                    const formattedTime = booking.scheduled_start_time || '10:00 AM';
                    const refDisplay = booking.reference_number || `#${booking.id}`;
                    const amountDisplay = booking.total_amount || booking.total_price || 0;

                    const isMenuOpen = activeMenuBookingId === booking.id;

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-gray-50/60 transition-colors group"
                      >
                        {/* DATE & TIME */}
                        <td className="py-4 px-6 text-gray-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="font-medium text-gray-900">
                              {formattedDate} - {formattedTime}
                            </span>
                          </div>
                        </td>

                        {/* REFERENCE # */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => onViewBookingDetail?.(booking.id)}
                            className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
                          >
                            {refDisplay}
                          </button>
                        </td>

                        {/* BUSINESS */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                              {booking.business_logo ? (
                                <img
                                  src={booking.business_logo}
                                  alt={booking.business_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 leading-snug">
                                {booking.business_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.business_category || 'Service Venue'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ORDER STATUS */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isVisited && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              VISITED
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              CONFIRMED
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              CANCELLED
                            </span>
                          )}
                          {!isVisited && !isConfirmed && !isCancelled && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                              {booking.status}
                            </span>
                          )}
                        </td>

                        {/* PAYMENT STATUS */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isPaid && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              PAID
                            </span>
                          )}
                          {isRefunded && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                              REFUNDED
                            </span>
                          )}
                          {!isPaid && !isRefunded && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                              {booking.payment_status}
                            </span>
                          )}
                        </td>

                        {/* AMOUNT */}
                        <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-gray-900">
                          ${amountDisplay.toFixed(2)}
                        </td>

                        {/* ACTIONS MENU */}
                        <td className="py-4 px-4 text-center relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuBookingId(isMenuOpen ? null : booking.id)
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Options */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuBookingId(null)}
                              />
                              <div className="absolute right-4 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 divide-y divide-gray-50 text-left text-sm animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuBookingId(null);
                                    onViewBookingDetail?.(booking.id);
                                  }}
                                  className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                  <span>View Details</span>
                                </button>

                                {isVisited && onReviewBookingService && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuBookingId(null);
                                      onReviewBookingService(booking.id);
                                    }}
                                    className="w-full px-4 py-2 text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
                                  >
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span>Review Service</span>
                                  </button>
                                )}

                                {!isCancelled && !isVisited && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuBookingId(null);
                                      setNewRescheduleDate(
                                        booking.scheduled_date ||
                                          new Date().toISOString().split('T')[0]
                                      );
                                      setRescheduleModalBooking(booking);
                                    }}
                                    className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-4 h-4 text-gray-500" />
                                    <span>Reschedule Booking</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuBookingId(null);
                                    setReceiptBooking(booking);
                                  }}
                                  className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Download className="w-4 h-4 text-gray-500" />
                                  <span>Download Receipt</span>
                                </button>

                                {!isCancelled && !isVisited && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuBookingId(null);
                                      setCancelModalBooking(booking);
                                    }}
                                    className="w-full px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                    <span>Cancel Booking</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer (Image 2 Style) */}
          {filteredBookings.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredBookings.length
                  )}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * itemsPerPage, filteredBookings.length)}
                </span>{' '}
                of <span className="font-semibold text-gray-900">{filteredBookings.length}</span>{' '}
                bookings
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to cancel booking{' '}
              <span className="font-semibold text-gray-900">
                {cancelModalBooking.reference_number || `#${cancelModalBooking.id}`}
              </span>{' '}
              at {cancelModalBooking.business_name}? A refund of $
              {cancelModalBooking.total_amount?.toFixed(2)} will be initiated to your original
              payment method.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                Reschedule Booking
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModalBooking(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select a new date and time for your appointment at{' '}
              <span className="font-semibold text-gray-700">
                {rescheduleModalBooking.business_name}
              </span>
              .
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  New Time Slot
                </label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setRescheduleModalBooking(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Official Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptBooking(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Provider</span>
                <span className="font-bold text-gray-900">{receiptBooking.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference</span>
                <span className="font-mono font-bold text-gray-900">
                  {receiptBooking.reference_number || `#${receiptBooking.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">{receiptBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900">
                  {receiptBooking.payment_method_display || 'Mastercard •••• 4242'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {receiptBooking.payment_status}
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                {receiptBooking.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>
                      {it.service_name} (x{it.quantity || 1})
                    </span>
                    <span>
                      $
                      {(
                        (it.price_charged || it.price || 0) * (it.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-extrabold text-base text-gray-900">
                  <span>Total Amount</span>
                  <span>${receiptBooking.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold shadow flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
