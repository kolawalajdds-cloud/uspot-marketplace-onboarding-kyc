import React, { useState } from 'react';
import { Search, MapPin, Star, ShieldCheck, Zap, Headphones, Check, Sparkles } from 'lucide-react';

interface CustomerHomeViewProps {
  onNavigateCategories: () => void;
  onNavigateCities: () => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onNavigateCategories,
  onNavigateCities,
}) => {
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [bookingVenue, setBookingVenue] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const recommendedSalons = [
    {
      id: 'glow-salon',
      name: 'Glow Salon',
      rating: '4.9',
      location: 'Tribeca, NY',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'onyx-spa',
      name: 'Onyx Spa',
      rating: '4.8',
      location: 'Mayfair, LDN',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'the-groomer',
      name: 'The Groomer',
      rating: '4.7',
      location: 'Shibuya, TYO',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'zenith-yoga',
      name: 'Zenith Yoga',
      rating: '4.9',
      location: 'Berlin, DE',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const clientReviews = [
    {
      stars: 5,
      quote:
        'URSPOT completely changed how I book beauty services. The quality of partners is outstanding and the process is seamless.',
      initial: 'E',
      name: 'Elena V.',
      title: 'Fashion Editor',
    },
    {
      stars: 5,
      quote:
        'As someone with a tight schedule, the quick booking and instant confirmations are a game changer. Highly recommended.',
      initial: 'M',
      name: 'Marcus L.',
      title: 'Architect',
    },
    {
      stars: 5,
      quote:
        'The premium experience starts from the app itself. Every detail feels considered and the concierge support is exceptional.',
      initial: 'S',
      name: 'Sophie T.',
      title: 'Creative Director',
    },
  ];

  const handleBook = (name: string) => {
    setBookingVenue(name);
    setBookingConfirmed(false);
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingVenue(null);
      setBookingConfirmed(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* Hero Section */}
      <section className="relative w-full bg-[#050607] py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Background Architectural Columns / Dark Marble Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-radial from-neutral-800/20 via-[#050607]/80 to-[#050607]" />
          {/* Subtle column pillars matching screenshot */}
          <div className="h-full w-full flex justify-around opacity-25">
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/30 to-transparent" />
            <div className="w-32 h-full bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent" />
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-neutral-600/30 to-transparent" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8">
            Find Your Next Appointment
          </h1>

          {/* Search Bar Pill */}
          <div className="bg-white rounded-full p-2 pl-5 sm:pl-6 shadow-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-2xl mx-auto border border-slate-100">
            <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto py-1 sm:py-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Service or Business..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto py-1 sm:py-0 border-t sm:border-t-0 border-slate-100">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Current Location"
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
              />
            </div>

            <button
              type="button"
              onClick={onNavigateCategories}
              className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-7 py-3 rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Browse by Category */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Browse by Category
            </h2>
          </div>

          {/* 10 Category Placeholder / Skeleton Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {[
              'Hair Salon',
              'Barbershop',
              'Spa & Massage',
              'Nails Care',
              'Skin Care',
              'Yoga & Pilates',
              'Fitness Gym',
              'Dental Care',
              'Photography',
              'Wellness',
            ].map((catName, idx) => (
              <button
                key={idx}
                type="button"
                onClick={onNavigateCategories}
                className="group h-24 rounded-2xl bg-[#F4F5F7] hover:bg-[#EAECEF] border border-slate-200/50 flex flex-col items-center justify-center p-2 transition-all cursor-pointer text-center"
              >
                <div className="w-7 h-7 rounded-xl bg-white/80 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center mb-1.5 text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 line-clamp-1">
                  {catName}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Limited Offer Banner */}
        <section className="bg-gradient-to-r from-[#0C0D0E] via-[#15171A] to-[#0C0D0E] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-slate-400 block mb-2">
              LIMITED OFFER
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
              Elevate Your Self-Care Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Enjoy 20% off your first booking at selected premium partner salons this month.
            </p>
            <button
              type="button"
              onClick={() => handleBook('Onyx Spa')}
              className="bg-white hover:bg-slate-100 text-black text-xs font-extrabold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Book Now
            </button>
          </div>

          {/* Cosmetic Bottles Artwork / High-end Visual */}
          <div className="relative shrink-0 flex items-center justify-center md:pr-4">
            <div className="w-56 sm:w-64 h-48 sm:h-52 relative flex items-end justify-center">
              {/* Product render container */}
              <div className="absolute inset-0 bg-radial from-neutral-700/20 to-transparent rounded-full blur-xl" />
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Cosmetics"
                className="w-full h-full object-contain filter drop-shadow-2xl relative z-10"
              />
            </div>
          </div>
        </section>

        {/* Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Recommended for You
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Top rated businesses in your area</p>
            </div>
            <button
              type="button"
              onClick={onNavigateCategories}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between p-3.5 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Image Container */}
                  <div className="h-44 w-full rounded-xl bg-slate-100 overflow-hidden relative mb-3">
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{salon.name}</h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                      <Star className="w-3 h-3 fill-current text-slate-900" />
                      {salon.rating}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{salon.location}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBook(salon.name)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Trust Value Props */}
        <section className="py-10 border-t border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* 1. Best Price Guarantee */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Best Price Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Found a lower price? We'll match it and give you an extra credit for your next visit.
              </p>
            </div>

            {/* 2. Easy & Quick Booking */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Zap className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Easy & Quick Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Book your preferred spot in under 60 seconds with instant confirmation and digital receipts.
              </p>
            </div>

            {/* 3. Customer Care 24/7 */}
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                <Headphones className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Care 24/7</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Our dedicated concierge team is always available to assist with your scheduling or questions.
              </p>
            </div>
          </div>
        </section>

        {/* What Our Clients Say */}
        <section>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight text-center mb-8">
            What Our Clients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientReviews.map((rev, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  {/* 5 Stars */}
                  <div className="flex items-center gap-1 mb-3 text-slate-950">
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current text-slate-950" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">"{rev.quote}"</p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none">{rev.name}</h4>
                    <span className="text-[11px] text-slate-400">{rev.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explore Top Destinations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Explore Top Destinations
            </h2>
            <button
              type="button"
              onClick={onNavigateCities}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          {/* 3 Dark City Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                city: 'New York',
                locations: '42+ Locations',
                bg: 'from-[#19222E] to-[#121820]',
              },
              {
                city: 'London',
                locations: '215+ Locations',
                bg: 'from-[#18212C] to-[#11161D]',
              },
              {
                city: 'Tokyo',
                locations: '310+ Locations',
                bg: 'from-[#1A232F] to-[#10151C]',
              },
            ].map((dest, i) => (
              <div
                key={i}
                onClick={onNavigateCities}
                className={`bg-gradient-to-b ${dest.bg} text-white rounded-2xl h-56 p-6 flex flex-col justify-end shadow-xs hover:scale-[1.01] transition-transform cursor-pointer border border-slate-800 relative overflow-hidden group`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white group-hover:translate-x-1 transition-transform">
                    {dest.city}
                  </h3>
                  <span className="text-xs text-slate-400 mt-0.5 block">{dest.locations}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Booking Modal */}
      {bookingVenue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Appointment Requested!</h3>
                <p className="text-xs text-slate-500">
                  Your spot at <strong className="text-slate-900">{bookingVenue}</strong> has been
                  scheduled. A confirmation receipt has been dispatched.
                </p>
              </div>
            ) : (
              <form onSubmit={confirmBooking} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Book Appointment</h3>
                  <button
                    type="button"
                    onClick={() => setBookingVenue(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Selected Venue
                  </label>
                  <input
                    type="text"
                    disabled
                    value={bookingVenue}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      defaultValue="2026-09-15"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                    <input
                      type="time"
                      required
                      defaultValue="14:00"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
