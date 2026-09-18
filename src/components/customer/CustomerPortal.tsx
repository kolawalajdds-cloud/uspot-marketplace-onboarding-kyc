import React, { useState } from 'react';
import { CustomerNavbar, CustomerNavPage } from './CustomerNavbar';
import { CustomerFooter } from './CustomerFooter';
import { CustomerHomeView } from './CustomerHomeView';
import { CustomerSpotsView } from './CustomerSpotsView';
import { CustomerCategoriesView } from './CustomerCategoriesView';
import { CustomerCitiesView } from './CustomerCitiesView';
import { CustomerSpotDetailView } from './CustomerSpotDetailView';
import { CustomerBookingFlowView } from './CustomerBookingFlowView';
import { CustomerMyBookingsView } from './CustomerMyBookingsView';
import { CustomerBookingDetailView } from './CustomerBookingDetailView';
import { CustomerReviewServiceView } from './CustomerReviewServiceView';
import { CustomerSettingsView } from './CustomerSettingsView';

export const CustomerPortal: React.FC = () => {
  const [activePage, setActivePage] = useState<CustomerNavPage>('home');
  const [spotsCategory, setSpotsCategory] = useState<string | undefined>(undefined);
  const [spotsQuery, setSpotsQuery] = useState<string | undefined>(undefined);
  const [spotsLocation, setSpotsLocation] = useState<string | undefined>(undefined);

  // Selected business and service for spot-detail and booking flow
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('biz-001');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  // Selected booking for booking-detail and review-service views
  const [selectedBookingId, setSelectedBookingId] = useState<string>('BK-USR-992834');

  const handleNavigateSpots = (category?: string, query?: string, location?: string) => {
    setSpotsCategory(category);
    setSpotsQuery(query);
    setSpotsLocation(location);
    setActivePage('spots');
  };

  const handleSelectSpotDetail = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setActivePage('spot-detail');
  };

  const handleBookSpot = (businessId: string, serviceId?: string) => {
    setSelectedBusinessId(businessId);
    setSelectedServiceId(serviceId);
    setActivePage('booking');
  };

  const handleViewBookingDetail = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActivePage('booking-detail');
  };

  const handleReviewBookingService = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActivePage('review-service');
  };

  return (
    <div id="customer-marketplace-portal" className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* Universal Customer Header: Logo, Home, Categories, Cities, Profile */}
      <CustomerNavbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Active Page View */}
      <main className="flex-1">
        {activePage === 'home' && (
          <CustomerHomeView
            onNavigateCategories={() => setActivePage('categories')}
            onNavigateCities={() => setActivePage('cities')}
            onNavigateMyBookings={() => setActivePage('my-bookings')}
            onNavigateSpots={handleNavigateSpots}
            onSelectSpotDetail={handleSelectSpotDetail}
            onBookSpot={handleBookSpot}
          />
        )}
        {activePage === 'spots' && (
          <CustomerSpotsView
            initialCategory={spotsCategory}
            initialQuery={spotsQuery}
            initialLocation={spotsLocation}
          />
        )}
        {activePage === 'categories' && (
          <CustomerCategoriesView
            onNavigateSpots={handleNavigateSpots}
          />
        )}
        {activePage === 'cities' && (
          <CustomerCitiesView
            onSelectSpotDetail={handleSelectSpotDetail}
            onBookSpot={handleBookSpot}
          />
        )}
        {activePage === 'spot-detail' && (
          <CustomerSpotDetailView
            businessId={selectedBusinessId}
            onBack={() => setActivePage('cities')}
            onBookService={(serviceId) => handleBookSpot(selectedBusinessId, serviceId)}
          />
        )}
        {activePage === 'booking' && (
          <CustomerBookingFlowView
            businessId={selectedBusinessId}
            initialServiceId={selectedServiceId}
            onBack={() => setActivePage('spot-detail')}
            onNavigateHome={() => setActivePage('home')}
            onNavigateMyBookings={() => setActivePage('my-bookings')}
            onNavigateSettings={() => setActivePage('settings')}
          />
        )}
        {activePage === 'my-bookings' && (
          <CustomerMyBookingsView
            onBookNewService={() => setActivePage('cities')}
            onViewBookingDetail={handleViewBookingDetail}
            onReviewBookingService={handleReviewBookingService}
          />
        )}
        {activePage === 'booking-detail' && (
          <CustomerBookingDetailView
            bookingId={selectedBookingId}
            onBack={() => setActivePage('my-bookings')}
            onReviewService={handleReviewBookingService}
          />
        )}
        {activePage === 'review-service' && (
          <CustomerReviewServiceView
            bookingId={selectedBookingId}
            onBack={() => setActivePage('my-bookings')}
          />
        )}
        {activePage === 'settings' && (
          <CustomerSettingsView
            onNavigateHome={() => setActivePage('home')}
            onNavigateBookings={() => setActivePage('my-bookings')}
          />
        )}
      </main>

      {/* Universal Customer Footer */}
      <CustomerFooter />
    </div>
  );
};
