import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  Shield,
  Compass,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { Business } from '../../types';
import { ServiceBookingModal } from './ServiceBookingModal';

interface CustomerCategoriesViewProps {
  onNavigateSpots?: (category?: string, query?: string, location?: string) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  countText: string;
  image: string;
  description: string;
  heroImage: string;
  featuredSpots: Array<{
    id: string;
    businessId: string;
    name: string;
    tag: string;
    rating: number;
    reviews: number;
    address: string;
    image: string;
    description: string;
  }>;
}

export const CustomerCategoriesView: React.FC<CustomerCategoriesViewProps> = ({
  onNavigateSpots,
}) => {
  const { state } = useDemo();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Dynamic booking modal state
  const [bookingBusiness, setBookingBusiness] = useState<Business | null>(null);
  const [isServiceBookingModalOpen, setIsServiceBookingModalOpen] = useState(false);

  const handleOpenBookingModal = (businessId: string) => {
    const biz = state.businesses.find((b) => b.id === businessId) || state.businesses[0];
    setBookingBusiness(biz);
    setIsServiceBookingModalOpen(true);
  };

  // Only display verified & live businesses approved by Super Admin
  const displayBusinesses = useMemo(() => {
    return state.businesses.filter(
      (b) =>
        b.status === 'Live' ||
        b.status === 'KYC Approved' ||
        (b as any).status === 'Active'
    );
  }, [state.businesses]);

  // Categories populated dynamically with actual vendor businesses
  const allCategories: CategoryItem[] = useMemo(() => {
    const baseCategories = [
      {
        id: 'barber',
        name: 'Barber',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
        description: 'From precision master fades to traditional hot towel straight-razor shaves, discover top-rated barbershops curated for discerning gentlemen.',
      },
      {
        id: 'spa',
        name: 'Spa',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80',
        description: 'Rejuvenate mind and body in serene sanctuaries offering thermal hydrotherapy, restorative facials, and holistic wellness therapies.',
      },
      {
        id: 'beauty',
        name: 'Beauty',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
        description: 'Boutique hair styling, aesthetic skin renewal, and luxury salon treatments provided by certified specialists.',
      },
      {
        id: 'wellness',
        name: 'Wellness',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
        description: 'Holistic lifestyle spaces, mindfulness sanctuaries, and functional physical recovery clinics.',
      },
      {
        id: 'fitness',
        name: 'Fitness',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=80',
        description: 'Private personal training suites, elite biomechanical performance labs, and high-intensity boutique fitness spaces.',
      },
      {
        id: 'nails',
        name: 'Nails',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1600&q=80',
        description: 'High-concept nail artistry, organic Japanese gel treatments, and meticulous manicure care designed for clean luxury.',
      },
      {
        id: 'massage',
        name: 'Massage',
        image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1600&q=80',
        description: 'Therapeutic deep tissue, Swedish relaxation, prenatal massage, and basalt hot stone therapies by licensed bodyworkers.',
      },
      {
        id: 'tailor',
        name: 'Tailor',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80',
        heroImage: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1600&q=80',
        description: 'Handcrafted bespoke suiting, precision garment alteration, and custom wardrobe tailoring using English and Italian wools.',
      },
    ];

    // Include custom categories from active businesses that are not in baseCategories
    const extraCategories: { id: string; name: string; image: string; heroImage: string; description: string }[] = [];
    displayBusinesses.forEach((b) => {
      const bCat = b.coreDetails?.category?.trim();
      if (!bCat) return;
      const alreadyHas = [...baseCategories, ...extraCategories].some((cat) => {
        const cName = cat.name.toLowerCase();
        const bLower = bCat.toLowerCase();
        return bLower.includes(cName) || cName.includes(bLower);
      });
      if (!alreadyHas) {
        extraCategories.push({
          id: bCat.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: bCat,
          image:
            b.imageGallery?.find((i) => i.isCover)?.url ||
            b.imageGallery?.[0]?.url ||
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80',
          heroImage:
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80',
          description: `Curated ${bCat} locations offering verified spaces and instant online booking on URSPOT.`,
        });
      }
    });

    return [...baseCategories, ...extraCategories].map((cat) => {
      // Find matching businesses from actual vendor businesses
      const matchingBusinesses = displayBusinesses.filter((b) => {
        const bCat = (b.coreDetails?.category || '').toLowerCase();
        const cName = cat.name.toLowerCase();
        return bCat.includes(cName) || cName.includes(bCat);
      });

      const featuredSpots = matchingBusinesses.map((b) => {
        const addrParts = [b.coreDetails?.streetAddress, b.coreDetails?.city, b.coreDetails?.state].filter(Boolean);
        const address = addrParts.length > 0 ? addrParts.join(', ') : 'United States';
        return {
          id: `feat-${b.id}`,
          businessId: b.id,
          name: b.coreDetails?.businessName || 'Untitled Business',
          tag: (b.coreDetails?.category || cat.name).toUpperCase(),
          rating: (b as any).rating || 4.9,
          reviews: (b as any).reviewCount || 18,
          address,
          image:
            b.imageGallery?.find((i) => i.isCover)?.url ||
            b.imageGallery?.[0]?.url ||
            (b.coreDetails?.category?.toLowerCase().includes('cowork')
              ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80'
              : cat.image),
          description: b.coreDetails?.description || `Curated ${cat.name} location offering verified services and instant online booking on URSPOT.`,
        };
      });

      return {
        ...cat,
        countText: `${matchingBusinesses.length} Location${matchingBusinesses.length === 1 ? '' : 's'}`,
        featuredSpots,
      };
    });
  }, [displayBusinesses]);

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const globalLocations = useMemo(() => {
    const set = new Set<string>();
    displayBusinesses.forEach((b) => {
      if (b.coreDetails?.city) set.add(b.coreDetails.city);
    });
    return set.size > 0 ? Array.from(set) : ['United States'];
  }, [displayBusinesses]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) return;
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setRequestEmail('');
    }, 2500);
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* SCREEN 4: CATEGORY DETAIL VIEW (When a category is selected)               */}
      {/* ========================================================================= */}
      {selectedCategory ? (
        <div>
          {/* Back Navigation Bar */}
          <div className="bg-slate-900 border-b border-slate-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Categories</span>
              </button>
              <span className="text-xs font-mono text-slate-400">
                Directory / {selectedCategory.name}
              </span>
            </div>
          </div>

          {/* Dark Atmospheric Hero Banner matching Screen 4 */}
          <section className="relative w-full bg-[#08090C] py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
            {/* Background Image with dark atmospheric overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={selectedCategory.heroImage}
                alt={selectedCategory.name}
                className="w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/80 to-[#08090C]/90" />
            </div>

            <div className="relative max-w-4xl mx-auto text-center z-10 space-y-5">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                {selectedCategory.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                {selectedCategory.description}
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateSpots) {
                      onNavigateSpots(selectedCategory.name);
                    }
                  }}
                  className="bg-white hover:bg-slate-100 text-black text-xs font-extrabold px-8 py-3 rounded-full transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <span>View Top Rated</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Locations & Showcase Section matching Screen 4 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Available in 8 Global Locations Pills */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Available in {globalLocations.length} Location{globalLocations.length === 1 ? '' : 's'}
                </h3>
                <span className="text-xs text-slate-400">Select city to filter</span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {globalLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      if (onNavigateSpots) {
                        onNavigateSpots(selectedCategory.name, undefined, loc);
                      }
                    }}
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-black hover:text-white hover:border-black text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </section>

            {/* Two Side-by-Side Showcase Cards matching Screen 4 */}
            <section>
              {selectedCategory.featuredSpots.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-sm font-bold text-slate-800">No registered businesses in this category yet</p>
                  <p className="text-xs text-slate-500 mt-1">Vendors have not yet added a business under {selectedCategory.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedCategory.featuredSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {spot.tag}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{spot.rating}</span>
                        <span className="text-slate-400 font-normal">({spot.reviews})</span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 mb-1.5">{spot.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{spot.address}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {spot.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenBookingModal(spot.businessId)}
                          className="flex-1 py-3 px-5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book a Session</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateSpots) {
                              onNavigateSpots(selectedCategory.name, spot.name);
                            }
                          }}
                          className="py-3 px-5 rounded-full border border-slate-200 hover:border-slate-400 text-slate-900 text-xs font-bold transition-all cursor-pointer"
                        >
                          Explore Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREEN 3: CATEGORIES DIRECTORY (8 Cards with Arrows & Pagination)         */
        /* ========================================================================= */
        <div>
          {/* Header Section matching Screen 3 */}
          <section className="pt-16 pb-10 px-4 sm:px-6 text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Find Your Dream Appointment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
              Browse our curated selection of top-tier services tailored to your lifestyle. Excellence,
              precision, and ease in every booking.
            </p>

            {/* Category Search Input */}
            <div className="max-w-xl mx-auto relative">
              <div className="rounded-full border border-slate-200 px-5 py-3.5 bg-white flex items-center gap-3 shadow-2xs focus-within:border-slate-400 transition-colors">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for categories (e.g., Wellness, Barber...)"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </section>

          {/* Grid of 8 Category Cards matching Screen 3 */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Category Image Area */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Bottom Label Bar with Right Arrow matching Screen 3 */}
                  <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-black transition-colors block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{cat.countText}</span>
                    </div>

                    {/* Right Arrow matching Screen 3 */}
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-black group-hover:text-white text-slate-700 flex items-center justify-center transition-all shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls matching Screen 3 */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                disabled={currentPage === 3}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Don't see your category? Email Request Banner (Full Width Dark Block) */}
      <section className="bg-black text-white py-14 px-6 sm:px-12 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Don't see your category?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              We are constantly expanding our partner network. Request a new service or join our
              waiting list for exclusive updates.
            </p>
          </div>

          <form
            onSubmit={handleRequestSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"
          >
            {requestSent ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-neutral-900 px-5 py-3 rounded-full border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>Request received! We'll notify you.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-72 bg-[#121315] border border-neutral-800 text-white text-xs px-4 py-3 rounded-full placeholder-neutral-500 focus:outline-hidden focus:border-neutral-600 font-medium"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black text-xs font-black tracking-wider px-7 py-3 rounded-full transition-colors cursor-pointer uppercase whitespace-nowrap shadow-xs"
                >
                  REQUEST
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Dynamic Multi-Service Booking Modal */}
      {isServiceBookingModalOpen && bookingBusiness && (
        <ServiceBookingModal
          business={bookingBusiness}
          isOpen={isServiceBookingModalOpen}
          onClose={() => {
            setIsServiceBookingModalOpen(false);
            setBookingBusiness(null);
          }}
        />
      )}
    </div>
  );
};
