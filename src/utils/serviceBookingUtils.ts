import { BusinessHours, BusinessService, Booking } from '../types';

export const DAY_NAMES = [
  'Sunday',    // 0
  'Monday',    // 1
  'Tuesday',   // 2
  'Wednesday', // 3
  'Thursday',  // 4
  'Friday',    // 5
  'Saturday',  // 6
] as const;

/**
 * Parses YYYY-MM-DD string into day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  if (!dateStr) return 1;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.getDay();
  }
  return new Date(dateStr).getDay();
}

/**
 * Converts "HH:MM", "HH:MM:SS" or "HH:MM AM/PM" into minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();

  // Handle 12-hour format with AM/PM (e.g., "09:30 AM", "05:00 PM")
  if (clean.toUpperCase().includes('AM') || clean.toUpperCase().includes('PM')) {
    const isPM = clean.toUpperCase().includes('PM');
    const isAM = clean.toUpperCase().includes('AM');
    const timePart = clean.replace(/AM|PM/i, '').trim();
    const [rawH, rawM] = timePart.split(':').map((n) => parseInt(n, 10) || 0);
    let h = rawH;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + rawM;
  }

  // Handle 24-hour format (e.g., "08:00", "19:30:00")
  const parts = clean.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Converts minutes from midnight into 12-hour formatted time (e.g. 540 -> "09:00 AM")
 */
export function minutesToTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const padH = h12.toString().padStart(2, '0');
  const padM = m.toString().padStart(2, '0');
  return `${padH}:${padM} ${period}`;
}

/**
 * Converts minutes from midnight into 24-hour formatted time (e.g. 540 -> "09:00")
 */
export function minutesToTime24(minutes: number): string {
  const normalized = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Generates initial 7-day business hours matching DBML business_hours schema
 */
export function getDefaultBusinessHours(businessId: string): BusinessHours[] {
  return [
    { id: `bh-${businessId}-0`, business_id: businessId, day_of_week: 0, open_time: '10:00', close_time: '16:00', is_closed: true },
    { id: `bh-${businessId}-1`, business_id: businessId, day_of_week: 1, open_time: '08:30', close_time: '19:00', is_closed: false },
    { id: `bh-${businessId}-2`, business_id: businessId, day_of_week: 2, open_time: '08:30', close_time: '19:00', is_closed: false },
    { id: `bh-${businessId}-3`, business_id: businessId, day_of_week: 3, open_time: '08:30', close_time: '19:00', is_closed: false },
    { id: `bh-${businessId}-4`, business_id: businessId, day_of_week: 4, open_time: '08:30', close_time: '19:00', is_closed: false },
    { id: `bh-${businessId}-5`, business_id: businessId, day_of_week: 5, open_time: '08:30', close_time: '19:00', is_closed: false },
    { id: `bh-${businessId}-6`, business_id: businessId, day_of_week: 6, open_time: '09:00', close_time: '17:30', is_closed: false },
  ];
}

export interface CalculatedTimeSlot {
  slotId: string;
  startTime: string;        // e.g. "09:30 AM"
  endTime: string;          // e.g. "10:50 AM"
  startMinutes: number;
  endMinutes: number;
  isAvailable: boolean;
  conflictReason?: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  itemSchedule: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    duration: number;
    startTime: string;
    endTime: string;
  }>;
}

export interface AvailabilityResult {
  isOpen: boolean;
  dayName: string;
  dayOfWeek: number;
  operatingHoursText: string;
  totalDurationMinutes: number;
  totalPrice: number;
  reason?: string;
  slots: CalculatedTimeSlot[];
}

/**
 * Calculates available multi-service time slots based on:
 * 1. Business working hours for that specific day of the week
 * 2. Total combined duration of all selected services
 * 3. Existing non-cancelled bookings for that business and date
 */
export function calculateMultiServiceAvailability(params: {
  businessHours: BusinessHours[];
  selectedServices: BusinessService[];
  dateStr: string;
  existingBookings: Booking[];
  businessId: string;
  slotIntervalMinutes?: number;
  bufferMinutes?: number;
}): AvailabilityResult {
  const {
    businessHours,
    selectedServices,
    dateStr,
    existingBookings,
    businessId,
    slotIntervalMinutes = 30,
    bufferMinutes = 0,
  } = params;

  const dayOfWeek = getDayOfWeekFromDate(dateStr);
  const dayName = DAY_NAMES[dayOfWeek];

  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.base_price, 0);

  // Find business hours for this day of week
  const daySchedule = businessHours?.find((bh) => bh.day_of_week === dayOfWeek);

  if (!daySchedule || daySchedule.is_closed) {
    return {
      isOpen: false,
      dayName,
      dayOfWeek,
      operatingHoursText: 'Closed',
      totalDurationMinutes,
      totalPrice,
      reason: `${dayName} is a scheduled day off for this business.`,
      slots: [],
    };
  }

  const openMins = timeToMinutes(daySchedule.open_time);
  const closeMins = timeToMinutes(daySchedule.close_time);

  if (closeMins <= openMins || totalDurationMinutes <= 0) {
    return {
      isOpen: false,
      dayName,
      dayOfWeek,
      operatingHoursText: `${minutesToTimeString(openMins)} - ${minutesToTimeString(closeMins)}`,
      totalDurationMinutes,
      totalPrice,
      reason: 'No services selected or invalid operating hours.',
      slots: [],
    };
  }

  // Active bookings on this date for this business
  const activeBookingsOnDate = (existingBookings || []).filter(
    (b) =>
      b.business_id === businessId &&
      b.booking_date === dateStr &&
      b.status !== 'cancelled'
  );

  const occupiedIntervals = activeBookingsOnDate.map((b) => {
    const bStart = timeToMinutes(b.scheduled_start_time);
    const bEnd = timeToMinutes(b.scheduled_end_time);
    return {
      start: bStart,
      end: bEnd > bStart ? bEnd : bStart + b.total_duration_minutes,
      customerName: b.customer_name,
    };
  });

  const slots: CalculatedTimeSlot[] = [];

  for (let candidateStart = openMins; candidateStart < closeMins; candidateStart += slotIntervalMinutes) {
    const candidateEnd = candidateStart + totalDurationMinutes;

    // Check if total duration exceeds business closing time
    const exceedsCloseTime = candidateEnd > closeMins;

    // Check if candidate slot overlaps with any existing booking
    let hasConflict = false;
    let conflictName = '';

    for (const occ of occupiedIntervals) {
      // Overlap condition: candidateStart < occ.end + buffer AND candidateEnd > occ.start - buffer
      if (candidateStart < occ.end + bufferMinutes && candidateEnd > occ.start - bufferMinutes) {
        hasConflict = true;
        conflictName = occ.customerName;
        break;
      }
    }

    const isAvailable = !exceedsCloseTime && !hasConflict;

    // Build sequential breakdown for each service in the bundle
    let runningMinutes = candidateStart;
    const itemSchedule = selectedServices.map((svc) => {
      const itemStart = runningMinutes;
      const itemEnd = itemStart + svc.duration_minutes;
      runningMinutes = itemEnd;
      return {
        serviceId: svc.id,
        serviceName: svc.name,
        price: svc.base_price,
        duration: svc.duration_minutes,
        startTime: minutesToTimeString(itemStart),
        endTime: minutesToTimeString(itemEnd),
      };
    });

    const period: 'Morning' | 'Afternoon' | 'Evening' =
      candidateStart < 12 * 60 ? 'Morning' : candidateStart < 17 * 60 ? 'Afternoon' : 'Evening';

    slots.push({
      slotId: `slot-${candidateStart}`,
      startTime: minutesToTimeString(candidateStart),
      endTime: minutesToTimeString(candidateEnd),
      startMinutes: candidateStart,
      endMinutes: candidateEnd,
      isAvailable,
      conflictReason: exceedsCloseTime
        ? 'Exceeds business closing hours'
        : hasConflict
        ? `Already booked (${conflictName || 'Reserved'})`
        : undefined,
      period,
      itemSchedule,
    });
  }

  return {
    isOpen: true,
    dayName,
    dayOfWeek,
    operatingHoursText: `${minutesToTimeString(openMins)} - ${minutesToTimeString(closeMins)}`,
    totalDurationMinutes,
    totalPrice,
    slots,
  };
}
