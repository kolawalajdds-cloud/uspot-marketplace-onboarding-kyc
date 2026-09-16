import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Business } from '../../types';
import { ServiceBookingModal } from './ServiceBookingModal';

interface CustomerSpotsViewProps {
  initialCategory?: string;
  initialQuery?: string;
  initialLocation?: string;
}

interface SpotItem {
  id: string;
  businessId: string; // connects to DemoContext business
  name: string;
  categoryBadge: string;
  categoryFilter: string;
  rating: number;
  address: string;
  image: string;
  isFavorite?: boolean;
}

export const CustomerSpotsView: React.FC<CustomerSpotsViewProps> = ({
  initialCategory,
  initialQuery = '',
  initialLocation = '',
}) => {
  const { state } = useDemo();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>(
    initialCategory || 'All'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Barber Shops',
  ]);
  const [distanceVal, setDistanceVal] = useState<number>(15);
  const [sortBy, setSortBy] = useState<'highest-rated' | 'most-popular' | 'distance'>('highest-rated');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Dynamic booking modal state
  const [bookingBusiness, setBookingBusiness] = useState<Business | null>(null);
  const [isServiceBookingModalOpen, setIsServiceBookingModalOpen] = useState(false);

  const handleOpenBookingModal = (businessId: string) => {
    const biz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    setBookingBusiness(biz);
    setIsServiceBookingModalOpen(true);
  };

  const toggleFavorite = (spotId: string) => {
    setFavorites((prev) => ({ ...prev, [spotId]: !prev[spotId] }));
  };

  const toggleCategoryCheckbox = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  // Spot list matching Screen 2
  const spotsList: SpotItem[] = useMemo(() => [
    {
      id: 'spot-1',
      businessId: 'biz-001', // Glow Salon / The Groomer
      name: 'The Groomer',
      categoryBadge: 'BARBER',
      categoryFilter: 'Barber',
      rating: 4.9,
      address: '224 West 57th St, NY',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-2',
      businessId: 'biz-002', // Onyx Spa / Luxe Spa
      name: 'Luxe Spa',
      categoryBadge: 'SPA',
      categoryFilter: 'Spa',
      rating: 4.7,
      address: '450 Hudson Street, NY',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-3',
      businessId: 'biz-001',
      name: 'Zen Wellness',
      categoryBadge: 'WELLNESS',
      categoryFilter: 'Wellness',
      rating: 4.8,
      address: '120 Broadway, NY',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-4',
      businessId: 'biz-001',
      name: 'Ink Master',
      categoryBadge: 'TATTOO',
      categoryFilter: 'Tattoo',
      rating: 4.8,
      address: '89 Bowery, NY',
      image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-5',
      businessId: 'biz-001',
      name: 'The Barber House',
      categoryBadge: 'BARBER',
      categoryFilter: 'Barber',
      rating: 4.5,
      address: '34th Ave, Queens',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-6',
      businessId: 'biz-002',
      name: 'Serene Nails',
      categoryBadge: 'NAILS',
      categoryFilter: 'Nails',
      rating: 4.4,
      address: '15th St, Chelsea',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-7',
      businessId: 'biz-001',
      name: 'Apex Hair Lounge',
      categoryBadge: 'HAIR',
      categoryFilter: 'Barber',
      rating: 4.9,
      address: '102 Madison Ave, NY',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'spot-8',
      businessId: 'biz-002',
      name: 'Onyx Mineral Baths',
      categoryBadge: 'SPA',
      categoryFilter: 'Spa',
      rating: 5.0,
      address: '88 Mayfair Blvd, LON',
      image: 'https://images.unsplash.com/photo-1512290900672-1f4f5f5c35df?auto=format&fit=crop&w=800&q=80',
    },
  ], []);

  const filteredSpots = useMemo(() => {
    return spotsList.filter((s) => {
      const matchPill =
        activeCategoryPill === 'All' ||
        s.categoryFilter.toLowerCase() === activeCategoryPill.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPill && matchQuery;
    });
  }, [spotsList, activeCategoryPill, searchQuery]);

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* Search Header Banner */}
      <section className="pt-12 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
          Find Your Dream Appointment
        </h1>

        {/* Search Bar with Black Button */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="rounded-2xl border border-slate-200/90 p-1.5 pl-4 bg-white flex items-center gap-3 shadow-2xs focus-within:border-slate-400 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, salons, or specialists..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
            />
            <button
              type="button"
              className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              Search
            </button>
          </div>
        </div>

        {/* Category Pills (All, Barber, Spa, Wellness, Tattoo, Nails) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['All', 'Barber', 'Spa', 'Wellness', 'Tattoo', 'Nails'].map((pill) => {
            const isSelected = activeCategoryPill === pill;
            return (
              <button
                key={pill}
                onClick={() => setActiveCategoryPill(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Content: Left Sidebar + Right Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Search Near Me Button */}
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-900" />
              <span>Search Near Me</span>
            </button>

            {/* Categories Checkbox List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                CATEGORIES
              </span>
              <div className="space-y-2.5 text-xs text-slate-700">
                {[
                  'Barber Shops',
                  'Massage & Spa',
                  'Yoga Studios',
                  'Skincare Centers',
                  'Hair Salons',
                ].map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategoryCheckbox(cat)}
                        className="w-4 h-4 rounded-md border-slate-300 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      <span className="font-medium text-slate-800">{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                DISTANCE
              </span>
              <input
                type="range"
                min="1"
                max="50"
                value={distanceVal}
                onChange={(e) => setDistanceVal(parseInt(e.target.value, 10))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>1 mile</span>
                <span>15 miles</span>
                <span>50 miles</span>
              </div>
            </div>

            {/* Promo Box */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Sign in to see personalized results based on your favorite locations.
              </p>
              <button
                type="button"
                className="text-xs font-bold text-slate-950 underline hover:text-slate-800 cursor-pointer block"
              >
                Learn more
              </button>
            </div>
          </aside>

          {/* Right Main Column: Spot Cards */}
          <div className="lg:col-span-9 space-y-6">
            {/* Results Header & Sorting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  Showing 1-{Math.min(filteredSpots.length, 8)} of 124 results
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Available Spots
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="highest-rated">Highest Rated</option>
                    <option value="most-popular">Most Popular</option>
                    <option value="distance">Distance</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3-Column Grid of Spot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.map((spot) => {
                const isFav = !!favorites[spot.id];
                return (
                  <div
                    key={spot.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Image Area with Category Badge & Heart */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge Top Left */}
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-2xs">
                        {spot.categoryBadge}
                      </span>

                      {/* Heart Top Right */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(spot.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                        title="Save to favorites"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Spot Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {spot.name}
                        </h3>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-900 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-black text-black" />
                          <span>{spot.rating}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </p>

                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(spot.businessId)}
                        className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination at Bottom */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === 1
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === 2
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === 3
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                3
              </button>

              <span className="text-xs text-slate-400 font-bold px-1">...</span>

              <button
                onClick={() => setCurrentPage(18)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === 18
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                18
              </button>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Service Booking Modal */}
      {isServiceBookingModalOpen && bookingBusiness && (
        <ServiceBookingModal
          business={bookingBusiness}
          onClose={() => {
            setIsServiceBookingModalOpen(false);
            setBookingBusiness(null);
          }}
        />
      )}
    </div>
  );
};
