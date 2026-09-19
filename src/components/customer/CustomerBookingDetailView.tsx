import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  Download,
  RotateCcw,
  Star,
  FileText,
  CreditCard,
  Building2,
  HelpCircle,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Receipt,
  X,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Booking, BookingStatus } from '../../types';

interface CustomerBookingDetailViewProps {
  bookingId: string;
  onBack: () => void;
  onReviewService?: (bookingId: string) => void;
}

export const CustomerBookingDetailView: React.FC<CustomerBookingDetailViewProps> = ({
  bookingId,
  onBack,
  onReviewService,
}) => {
  const { bookings, cancelBooking, rescheduleBooking } = useDemo();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const booking = bookings.find((b) => b.id === bookingId || b.reference_number === bookingId);

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">Could not find booking reference {bookingId}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </button>
      </div>
    );
  }

  const isVisited = booking.status === 'visited';
  const isCancelled = booking.status === 'cancelled';
  const isConfirmed = booking.status === 'confirmed';
  const isRefunded = booking.payment_status === 'refunded' || booking.refund_status !== undefined;

  const subtotal = booking.items.reduce(
    (acc, item) => acc + (item.price_charged || item.price || 0) * (item.quantity || 1),
    0
  );
  const taxAmount = booking.tax_amount ?? 0.0;
  const serviceFee = booking.service_fee ?? 0.0;
  const grandTotal = booking.net_amount || subtotal;

  const handleConfirmReschedule = () => {
    if (!newDate) return;
    rescheduleBooking(booking.id, newDate, newTime);
    setShowRescheduleModal(false);
  };

  const handleConfirmCancel = () => {
    cancelBooking(booking.id);
    setShowCancelModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to My Bookings</span>
          </button>

          <div className="flex items-center gap-3 self-start sm:self-auto relative">
            {!isCancelled && !isVisited && (
              <button
                onClick={() => {
                  setNewDate(booking.scheduled_date || new Date().toISOString().split('T')[0]);
                  setShowRescheduleModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
                <span>Reschedule Booking</span>
              </button>
            )}

            {isVisited && onReviewService && (
              <button
                onClick={() => onReviewService(booking.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-amber-600/20 transition-all"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Review Services</span>
              </button>
            )}

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <span>Actions</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isActionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsActionsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 divide-y divide-gray-50 text-sm">
                    {onReviewService && (
                      <button
                        onClick={() => {
                          setIsActionsOpen(false);
                          onReviewService(booking.id);
                        }}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2.5 transition-colors"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Review Services</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsActionsOpen(false);
                        setShowReceiptModal(true);
                      }}
                      className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                      <span>Download Receipt</span>
                    </button>

                    {!isCancelled && !isVisited && (
                      <button
                        onClick={() => {
                          setIsActionsOpen(false);
                          setShowCancelModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Booking Title & Status Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-gray-900 tracking-tight">
                  {booking.reference_number || `#${booking.id}`}
                </span>

                {/* Status Pill */}
                {isVisited && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VISITED
                  </span>
                )}
                {isConfirmed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONFIRMED
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5" />
                    CANCELLED
                  </span>
                )}

                {/* Payment Pill */}
                {booking.payment_status === 'paid' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PAID
                  </span>
                )}
                {booking.payment_status === 'refunded' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                    REFUNDED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{booking.business_name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {booking.scheduled_date
                      ? new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Tuesday, Oct 24, 2023'}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{booking.scheduled_start_time || '10:00 AM'}</span>
                  <span>({booking.total_duration_minutes || 95} Mins)</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider block">
                Total Paid
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Services Line Items Table (Matching Image 3) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Booked Services</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-6">SERVICE</th>
                  <th className="py-3 px-4 text-center">QTY</th>
                  <th className="py-3 px-4">DATE & TIME</th>
                  <th className="py-3 px-4">DURATION</th>
                  <th className="py-3 px-4 text-right">PRICE</th>
                  <th className="py-3 px-6 text-right">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {booking.items.map((item, idx) => {
                  const qty = item.quantity || 1;
                  const price = item.price_charged || item.price || 0;
                  const lineTotal = price * qty;

                  return (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{item.service_name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-gray-700">{qty}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                        {booking.scheduled_date
                          ? new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Oct 24, 2023'}{' '}
                        - {booking.scheduled_start_time || '10:00 AM'}
                      </td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap font-medium">
                        {item.duration_minutes} Min
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-800">
                        ${price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotals breakdown */}
          <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-5">
            <div className="max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee</span>
                <span className="font-medium text-gray-900">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                <span>Total Paid</span>
                <span className="text-amber-700">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid (Order Info, Payment Summary, Special Instructions, Refund Tracking) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Order Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Order Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Reference</span>
                <span className="font-mono font-bold text-gray-900">
                  {booking.reference_number || `#${booking.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Date</span>
                <span className="text-gray-900 font-medium">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Oct 20, 2023, 14:22'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Provider</span>
                <span className="text-gray-900 font-medium">{booking.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Duration</span>
                <span className="text-gray-900 font-medium">
                  {booking.total_duration_minutes || 95} Minutes ({booking.items.length} Services)
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900">
                  {booking.payment_method_display || 'Mastercard •••• 4242'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  TXN-{booking.id.replace(/\D/g, '') || '882910442'}-NMI
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date</span>
                <span className="text-gray-900 font-medium">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Oct 20, 2023, 14:23'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-bold text-xs uppercase px-2 py-0.5 rounded-full ${
                    booking.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.payment_status === 'paid' ? 'Paid in Full' : 'Refunded'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Special Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              Special Instructions
            </h3>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
              {booking.special_instructions ||
                booking.notes ||
                'No special instructions provided by the customer.'}
            </div>
          </div>

          {/* Card 4: Refund Tracking (Matching Image 4) */}
          {isRefunded ? (
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Refund Tracking
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {booking.refund_status?.toUpperCase() || 'REFUNDED'}
                </span>
              </div>

              {/* 3-Step Stepper Timeline (Matching Image 4) */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-emerald-50">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-bold text-gray-900">Refund Initiated</div>
                  <div className="text-xs text-gray-500">
                    Cancellation confirmed on{' '}
                    {booking.scheduled_date
                      ? new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Oct 10, 2023'}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-emerald-50">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-bold text-gray-900">Gateway Processing</div>
                  <div className="text-xs text-gray-500">NMI Gateway settlement batch approved</div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-emerald-50">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-bold text-emerald-900">
                    Refund Completed (${grandTotal.toFixed(2)})
                  </div>
                  <div className="text-xs text-gray-500">
                    Credited back to {booking.payment_method_display || 'Mastercard •••• 4242'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-medium">
                  Reference: <span className="font-mono">{booking.refund_id || 'RF-7734019-NMI'}</span>
                </p>
                <p className="text-gray-500 mt-0.5">
                  Estimated settlement: {booking.refund_estimated_date || 'Oct 12, 2023'}. Depending on
                  your bank, funds typically appear in 2-5 business days.
                </p>
              </div>
            </div>
          ) : (
            /* Provider Contact / Support Card */
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Customer Support & Venue Info
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="text-xs leading-relaxed">
                  Need to make changes or have questions regarding your appointment? Contact the venue
                  management directly or reach our customer concierge.
                </p>
                <div className="pt-2 flex flex-col gap-2 text-xs font-medium">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+1 (800) 555-SPOT (Customer Concierge)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>support@uspot-marketplace.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Cancel Booking?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel booking{' '}
              <span className="font-semibold text-gray-900">
                {booking.reference_number || `#${booking.id}`}
              </span>{' '}
              at {booking.business_name}? A full refund of ${grandTotal.toFixed(2)} will be
              automatically processed to your original payment method.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                Reschedule Booking
              </h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select a new date and time for your appointment at {booking.business_name}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  New Time Slot
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Merchant</span>
                <span className="font-bold text-gray-900">{booking.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference #</span>
                <span className="font-mono font-bold text-gray-900">
                  {booking.reference_number || `#${booking.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Card</span>
                <span className="font-medium text-gray-900">
                  {booking.payment_method_display || 'Mastercard •••• 4242'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-emerald-700 uppercase">Paid / Settled</span>
              </div>

              <div className="border-t pt-3 space-y-2">
                {booking.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>
                      {it.service_name} (x{it.quantity || 1})
                    </span>
                    <span>${((it.price_charged || it.price || 0) * (it.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-gray-500">
                  <span>Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-extrabold text-base text-gray-900">
                  <span>Total Paid</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold shadow flex items-center gap-2"
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
