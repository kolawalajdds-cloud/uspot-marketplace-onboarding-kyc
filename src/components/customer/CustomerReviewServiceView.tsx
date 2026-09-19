import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Check,
  Send,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Booking, ServiceReviewItem } from '../../types';

interface CustomerReviewServiceViewProps {
  bookingId: string;
  onBack: () => void;
}

export const CustomerReviewServiceView: React.FC<CustomerReviewServiceViewProps> = ({
  bookingId,
  onBack,
}) => {
  const { bookings, submitBookingReview } = useDemo();

  // Find the target booking
  const booking = bookings.find((b) => b.id === bookingId || b.reference_number === bookingId);

  // Local form state for unsubmitted services
  const [reviewsState, setReviewsState] = useState<
    Record<
      string,
      {
        rating: number;
        reviewText: string;
        media: string[];
      }
    >
  >(() => {
    const initial: Record<string, { rating: number; reviewText: string; media: string[] }> = {};
    if (booking?.items) {
      booking.items.forEach((item) => {
        const existingReview = booking.reviews?.[item.business_service_id];
        initial[item.business_service_id] = {
          rating: existingReview?.rating || 5,
          reviewText: existingReview?.review_text || '',
          media: existingReview?.media || [],
        };
      });
    }
    return initial;
  });

  const [hoveredStars, setHoveredStars] = useState<Record<string, number>>({});
  const [submittingServiceId, setSubmittingServiceId] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't locate the requested booking reference.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </button>
      </div>
    );
  }

  const handleRatingChange = (serviceId: string, rating: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        rating,
      },
    }));
  };

  const handleTextChange = (serviceId: string, reviewText: string) => {
    setReviewsState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        reviewText,
      },
    }));
  };

  const handleAddMedia = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const currentList = reviewsState[serviceId]?.media || [];
    const remainingSlots = 13 - currentList.length; // max 10 photos + 3 videos
    if (remainingSlots <= 0) return;

    const newFiles = (Array.from(e.target.files) as File[]).slice(0, remainingSlots);
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));

    setReviewsState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        media: [...(prev[serviceId]?.media || []), ...newUrls],
      },
    }));
  };

  const handleRemoveMedia = (serviceId: string, indexToRemove: number) => {
    setReviewsState((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        media: (prev[serviceId]?.media || []).filter((_, i) => i !== indexToRemove),
      },
    }));
  };

  const handleSubmitSingleReview = (serviceId: string, serviceName: string) => {
    const data = reviewsState[serviceId];
    if (!data) return;

    setSubmittingServiceId(serviceId);
    setTimeout(() => {
      submitBookingReview(booking.id, serviceId, {
        service_name: serviceName,
        rating: data.rating,
        review_text: data.reviewText.trim() || 'Great service experience!',
        media: data.media,
      });
      setSubmittingServiceId(null);
      setSubmissionSuccess(serviceId);
      setTimeout(() => setSubmissionSuccess(null), 4000);
    }, 600);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '5.0 - Exceptional';
      case 4:
        return '4.0 - Very Good';
      case 3:
        return '3.0 - Good / Average';
      case 2:
        return '2.0 - Below Expectations';
      case 1:
        return '1.0 - Poor Experience';
      default:
        return `${stars}.0 Stars`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to My Bookings</span>
          </button>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-50/50 to-orange-50/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verified Customer Experience</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Review Your Services
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-700">{booking.business_name}</span>
                  <span>•</span>
                  <span className="font-mono text-gray-600">
                    {booking.reference_number || `#${booking.id}`}
                  </span>
                  <span>•</span>
                  <span>
                    Visited on{' '}
                    {booking.scheduled_date
                      ? new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Oct 24, 2023'}
                  </span>
                </p>
              </div>

              {booking.business_category && (
                <div className="self-start sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                  {booking.business_category}
                </div>
              )}
            </div>

            {/* Explanatory Banner */}
            <div className="mt-5 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800 text-xs sm:text-sm flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  Your feedback helps service providers improve and empowers other community members
                  to make informed choices.
                </p>
                <p className="text-blue-700/80 text-xs mt-0.5">
                  You can provide individual reviews for each service included in this visit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* List of Services to Review */}
        <div className="space-y-6">
          {booking.items.map((item, index) => {
            const serviceId = item.business_service_id;
            const existingReview = booking.reviews?.[serviceId];
            const isAlreadySubmitted = existingReview?.submitted;
            const currentForm = reviewsState[serviceId] || {
              rating: 5,
              reviewText: '',
              media: [],
            };
            const currentRating = hoveredStars[serviceId] ?? currentForm.rating;
            const isCurrentlySubmitting = submittingServiceId === serviceId;
            const justSubmitted = submissionSuccess === serviceId;

            return (
              <div
                key={item.id || serviceId}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  isAlreadySubmitted
                    ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Service Card Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/50">
                        SERVICE 0{index + 1}
                      </span>
                      {isAlreadySubmitted && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ALREADY SUBMITTED
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {item.service_name}
                    </h2>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-900">
                      ${item.price_charged?.toFixed(2) || item.price?.toFixed(2) || '0.00'}
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.duration_minutes} Min</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8">
                  {isAlreadySubmitted ? (
                    /* SUBMITTED REVIEW DISPLAY (Image 1 Style) */
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center text-amber-400 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= (existingReview.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-200 fill-gray-100'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {getRatingLabel(existingReview.rating || 5)}
                          </span>
                        </div>
                      </div>

                      {existingReview.review_text && (
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80">
                          <p className="text-sm text-gray-800 leading-relaxed font-normal italic">
                            "{existingReview.review_text}"
                          </p>
                          {existingReview.submitted_at && (
                            <p className="text-[11px] text-gray-400 mt-2">
                              Published on{' '}
                              {new Date(existingReview.submitted_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Display Uploaded Media */}
                      {existingReview.media && existingReview.media.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                            Customer Photos & Videos ({existingReview.media.length})
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {existingReview.media.map((imgUrl, i) => (
                              <div
                                key={i}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review attachment ${i + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* INTERACTIVE FORM FOR UNREVIEWED SERVICE (Image 1 Style) */
                    <div className="space-y-6">
                      {/* Overall Rating Section */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Overall Rating <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div
                            className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-200"
                            onMouseLeave={() =>
                              setHoveredStars((prev) => ({ ...prev, [serviceId]: undefined as any }))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(serviceId, star)}
                                onMouseEnter={() =>
                                  setHoveredStars((prev) => ({ ...prev, [serviceId]: star }))
                                }
                                className="p-1 rounded-lg hover:bg-amber-50 transition-colors focus:outline-none"
                              >
                                <Star
                                  className={`w-7 h-7 transition-all ${
                                    star <= currentRating
                                      ? 'fill-amber-400 text-amber-400 scale-110'
                                      : 'text-gray-300 hover:text-amber-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {getRatingLabel(currentRating)}
                          </span>
                        </div>
                      </div>

                      {/* Your Experience Textarea */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-bold text-gray-900">
                            Your Experience <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-xs text-gray-400">
                            {currentForm.reviewText.length} / 1000 characters
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          maxLength={1000}
                          value={currentForm.reviewText}
                          onChange={(e) => handleTextChange(serviceId, e.target.value)}
                          placeholder="Describe your experience, quality of service, punctuality, ambiance, and any standout details..."
                          className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-y"
                        />
                      </div>

                      {/* Add Photos or Videos Upload Section */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-bold text-gray-900">
                            Add Photos or Videos <span className="text-xs font-normal text-gray-500">(Optional)</span>
                          </label>
                          <span className="text-xs text-gray-400">
                            Max 10 photos, 3 videos
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Upload high resolution photos and short clips showing the service results.
                        </p>

                        {/* Dropzone */}
                        <label className="border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime"
                            onChange={(e) => handleAddMedia(serviceId, e)}
                            className="hidden"
                          />
                          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">
                            Click or drag images & videos here
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WEBP, MP4, MOV up to 50MB
                          </p>
                        </label>

                        {/* Media previews */}
                        {currentForm.media.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {currentForm.media.map((url, i) => (
                              <div
                                key={i}
                                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm group"
                              >
                                <img
                                  src={url}
                                  alt="Upload preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(serviceId, i)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit single service review action button */}
                      <div className="pt-2 flex items-center justify-between border-t border-gray-100 flex-wrap gap-4">
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          {justSubmitted && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <Check className="w-4 h-4" /> Review submitted successfully!
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleSubmitSingleReview(serviceId, item.service_name)
                            }
                            disabled={isCurrentlySubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md shadow-amber-600/20 hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isCurrentlySubmitting ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Submit Review</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Footer Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-gray-500">
            <Info className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Reviews are published publicly under your customer username.</span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Return to Bookings
          </button>
        </div>
      </div>
    </div>
  );
};
