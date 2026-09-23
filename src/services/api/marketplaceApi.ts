import { apiRequest } from './apiClient';
import {
  UserProfile,
  Business,
  BusinessService,
  ServiceCategory,
  Booking,
  BusinessReview,
  CustomerSavedCard,
  MarketplaceTransaction,
  BusinessBalance,
  BookingPaymentMethod,
  BookingStatus,
  WorkerJob,
  WorkerContract,
  WorkerTransaction,
  WorkerStats,
  WorkerBusinessSchedule,
  AvailableWorkerResult,
} from '../../types';

// ============================================================================
// 1. USERS & AUTH
// ============================================================================
export const userService = {
  getUsers: () => apiRequest<UserProfile[]>('/users'),
  getUser: (id: string) => apiRequest<UserProfile>(`/users/${id}`),
  login: (identifier: string, password?: string, role?: string) =>
    apiRequest<{ success: boolean; user: UserProfile; business?: any }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password, role }),
    }),
  register: (payload: {
    accountType: 'personal' | 'business';
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
    nickname?: string;
    username?: string;
    marketingOptIn?: boolean;
  }) =>
    apiRequest<{
      success: boolean;
      user: UserProfile;
      business?: any;
    }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createUser: (data: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<UserProfile>) =>
    apiRequest<UserProfile>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// 2. BUSINESSES
// ============================================================================
export const businessService = {
  getBusinesses: () => apiRequest<Business[]>('/businesses'),
  getBusiness: (id: string) => apiRequest<Business>(`/businesses/${id}`),
  createBusiness: (data: Partial<Business>) =>
    apiRequest<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBusiness: (id: string, data: Partial<Business>) =>
    apiRequest<Business>(`/businesses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// 3. COMPLIANCE & KYC
// ============================================================================
export const complianceService = {
  getCompliance: (businessId: string) => apiRequest<any>(`/compliance/${businessId}`),
  submitKyc: (params: { businessId: string; verificationData: any; signature?: string; signatureDate?: string }) =>
    apiRequest<{ success: boolean; kyc: any }>('/compliance/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  reviewKyc: (params: { businessId: string; action: 'approve' | 'reject'; reviewerName?: string; rejectionReason?: string }) =>
    apiRequest<{ success: boolean; kyc: any; businessStatus: string }>('/compliance/kyc/review', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  signW9: (params: { businessId: string; w9Data: any }) =>
    apiRequest<{ success: boolean; w9: any }>('/compliance/w9/sign', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  onboardNmi: (params: { businessId: string; nmiAccount: any }) =>
    apiRequest<{ success: boolean; nmi: any }>('/compliance/nmi/onboard', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// ============================================================================
// 4. SERVICE CATALOG
// ============================================================================
export const serviceCatalogService = {
  getAllServices: () => apiRequest<BusinessService[]>('/services'),
  getCategories: () => apiRequest<ServiceCategory[]>('/services/categories'),
  getBusinessServices: (businessId: string) => apiRequest<BusinessService[]>(`/services/business/${businessId}`),
  addService: (service: Partial<BusinessService>) =>
    apiRequest<BusinessService>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  updateService: (id: string, service: Partial<BusinessService>) =>
    apiRequest<BusinessService>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(service),
    }),
  deleteService: (id: string) =>
    apiRequest<{ success: boolean }>(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// 5. CUSTOMER SAVED CARDS
// ============================================================================
export const cardService = {
  getAllCards: (customerId?: string) =>
    apiRequest<CustomerSavedCard[]>(`/customer/cards${customerId ? `?customerId=${customerId}` : ''}`),
  getCards: (customerId: string) => apiRequest<CustomerSavedCard[]>(`/customer/cards/customer/${customerId}`),
  addCard: (card: Omit<CustomerSavedCard, 'id' | 'created_at'>) =>
    apiRequest<CustomerSavedCard>('/customer/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    }),
  setDefaultCard: (id: string, customerId: string) =>
    apiRequest<CustomerSavedCard>(`/customer/cards/${id}/default`, {
      method: 'PATCH',
      body: JSON.stringify({ customerId }),
    }),
  removeCard: (id: string) =>
    apiRequest<{ success: boolean }>(`/customer/cards/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// 6. BOOKINGS
// ============================================================================
export const bookingService = {
  getBookings: (params?: { customerId?: string; businessId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<Booking[]>(`/bookings${query ? `?${query}` : ''}`);
  },
  getBooking: (id: string) => apiRequest<Booking>(`/bookings/${id}`),
  createBooking: (params: {
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    businessId: string;
    items: any[];
    dateStr: string;
    startTime: string;
    paymentMethod: BookingPaymentMethod;
    paymentMethodDisplay?: string;
    totalAmount?: number;
    taxAmount?: number;
    referenceNumber?: string;
    notes?: string;
  }) =>
    apiRequest<{ success: boolean; booking: Booking; message: string }>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  updateStatus: (id: string, status: BookingStatus, cancellationReason?: string) =>
    apiRequest<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellationReason }),
    }),
  reschedule: (id: string, newDate: string, newStartTime: string) =>
    apiRequest<Booking>(`/bookings/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newDate, newStartTime }),
    }),
};

// ============================================================================
// 7. REVIEWS & RESPONSES
// ============================================================================
export const reviewService = {
  getAllReviews: () => apiRequest<BusinessReview[]>('/reviews'),
  getReviews: (businessId: string) => apiRequest<BusinessReview[]>(`/reviews/business/${businessId}`),
  addReview: (reviewData: {
    businessId: string;
    bookingId?: string;
    serviceId?: string;
    serviceName?: string;
    customerId?: string;
    customerName: string;
    rating: number;
    reviewText: string;
    media?: string[];
  }) =>
    apiRequest<BusinessReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
  replyToReview: (reviewId: string, replyText: string, authorName?: string) =>
    apiRequest<{ success: boolean; response: any }>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyText, authorName }),
    }),
};

// ============================================================================
// 8. FINANCIAL LEDGER
// ============================================================================
export const ledgerService = {
  getTransactions: (businessId?: string) =>
    apiRequest<MarketplaceTransaction[]>(`/ledger/transactions${businessId ? `?businessId=${businessId}` : ''}`),
  getBalance: (businessId: string) => apiRequest<BusinessBalance>(`/ledger/balance/${businessId}`),
  requestWithdrawal: (params: {
    businessId: string;
    amount: number;
    requestedByUserId?: string;
    requestedByUserName?: string;
    maskedBankAccount?: string;
    bankAccountHolder?: string;
  }) =>
    apiRequest<any>('/ledger/withdraw', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// ============================================================================
// 9. WORKER SERVICE (FEATURES 0-11)
// ============================================================================
export const workerService = {
  login: (identifier: string) =>
    apiRequest<{ success: boolean; worker: UserProfile }>('/worker/login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
  onboard: (data: {
    fullName: string;
    email: string;
    phone?: string;
    primaryServiceCategory?: string;
    yearsOfExperience?: number | string;
    hourlyRate?: number;
    payoutBankName?: string;
    payoutRoutingNumber?: string;
    payoutAccountNumber?: string;
    skills?: string[];
  }) =>
    apiRequest<{ success: boolean; worker: UserProfile }>('/worker/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDashboard: (workerId: string) =>
    apiRequest<{
      stats: WorkerStats;
      activeJob: WorkerJob | null;
      nextJob: WorkerJob | null;
      todayJobs: WorkerJob[];
      recentJobs: WorkerJob[];
    }>(`/worker/${workerId}/dashboard`),
  getJobs: (workerId: string, params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<WorkerJob[]>(`/worker/${workerId}/jobs${qs}`);
  },
  getJob: (workerId: string, jobId: string) =>
    apiRequest<WorkerJob>(`/worker/${workerId}/jobs/${jobId}`),
  checkIn: (workerId: string, jobId: string, notes?: string, photos?: string[]) =>
    apiRequest<{ success: boolean; job: WorkerJob }>(`/worker/${workerId}/jobs/${jobId}/check-in`, {
      method: 'PATCH',
      body: JSON.stringify({ checkInNotes: notes, checkInPhotos: photos }),
    }),
  checkOut: (
    workerId: string,
    jobId: string,
    data: {
      checkOutNotes?: string;
      customerSignOffName?: string;
      signature?: string;
      tip?: number;
      rating?: number;
      feedback?: string;
    }
  ) =>
    apiRequest<{ success: boolean; job: WorkerJob }>(`/worker/${workerId}/jobs/${jobId}/check-out`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getCalendar: (workerId: string) => apiRequest<WorkerJob[]>(`/worker/${workerId}/calendar`),
  getContracts: (workerId: string) => apiRequest<WorkerContract[]>(`/worker/${workerId}/contracts`),
  getContract: (workerId: string, contractId: string) =>
    apiRequest<WorkerContract>(`/worker/${workerId}/contracts/${contractId}`),
  signContract: (workerId: string, contractId: string, signature: string) =>
    apiRequest<{ success: boolean; contract: WorkerContract }>(`/worker/${workerId}/contracts/${contractId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),
  getEarnings: (workerId: string) =>
    apiRequest<{
      totalEarnings: number;
      availableBalance: number;
      averageJobPayout: number;
      totalTips: number;
      totalHoursWorked: number;
      recentPayouts: WorkerTransaction[];
    }>(`/worker/${workerId}/earnings`),
  getTransactions: (workerId: string) =>
    apiRequest<WorkerTransaction[]>(`/worker/${workerId}/transactions`),
  requestPayout: (workerId: string, amount: number, bankName?: string, accountMasked?: string) =>
    apiRequest<{ success: boolean; transaction: WorkerTransaction }>(`/worker/${workerId}/payout`, {
      method: 'POST',
      body: JSON.stringify({ amount, bankName, accountMasked }),
    }),
  getSchedule: (workerId: string) =>
    apiRequest<WorkerBusinessSchedule[]>(`/worker/${workerId}/schedule`),
  saveSchedule: (workerId: string, slots: Partial<WorkerBusinessSchedule>[]) =>
    apiRequest<{ success: boolean; count: number; schedule: WorkerBusinessSchedule[] }>(`/worker/${workerId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    }),
  getAvailableWorkersForBusiness: (
    businessId: string,
    params?: { date?: string; time?: string; startTime?: string; endTime?: string; timeSlot?: string }
  ) => {
    const q = new URLSearchParams();
    if (params?.date) q.append('date', params.date);
    if (params?.time) q.append('time', params.time);
    if (params?.startTime) q.append('startTime', params.startTime);
    if (params?.endTime) q.append('endTime', params.endTime);
    if (params?.timeSlot) q.append('timeSlot', params.timeSlot);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<{
      success: boolean;
      businessId: string;
      businessName: string;
      date: string;
      dayName: string;
      dayOfWeek: number;
      requestedTimeWindow: { startTime: string; endTime: string };
      availableCount: number;
      workers: AvailableWorkerResult[];
    }>(`/worker/businesses/${businessId}/available-workers${qs}`);
  },
  assignWorkerToJob: (
    businessId: string,
    data: {
      workerId: string;
      bookingId?: string;
      title: string;
      serviceCategory?: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      location?: string;
      scheduledDate: string;
      scheduledStartTime?: string;
      scheduledEndTime?: string;
      durationMinutes?: number;
      rate?: number | string;
      notes?: string;
    }
  ) =>
    apiRequest<{ success: boolean; job: WorkerJob; message: string }>(`/worker/businesses/${businessId}/assign-job`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


