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
} from '../../types';

// ============================================================================
// 1. USERS & AUTH
// ============================================================================
export const userService = {
  getUsers: () => apiRequest<UserProfile[]>('/users'),
  getUser: (id: string) => apiRequest<UserProfile>(`/users/${id}`),
  login: (identifier: string, role?: string) =>
    apiRequest<{ success: boolean; user: UserProfile; business?: any }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, role }),
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
