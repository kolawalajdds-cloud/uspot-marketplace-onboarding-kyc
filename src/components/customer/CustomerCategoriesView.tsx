import React, { useState } from 'react';
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

  // 8 Categories matching Screen 3
  const allCategories: CategoryItem[] = [
    {
      id: 'barber',
      name: 'Barber',
      countText: '28+ Locations',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
      description:
        'From precision master fades to traditional hot towel straight-razor shaves, discover top-rated barbershops curated for discerning gentlemen.',
      featuredSpots: [
        {
          id: 'b-spot-1',
          businessId: 'biz-001',
          name: 'The Sovereign Barber Club',
          tag: 'LUXURY EXPERIENCE',
          rating: 4.9,
          reviews: 142,
          address: '45 Spring St, SoHo, New York',
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=80',
          description: 'A bespoke sanctuary offering private grooming suites, single-barrel bourbon tastings, and master barber craftsmanship.',
        },
        {
          id: 'b-spot-2',
          businessId: 'biz-001',
          name: 'Crown & Blade Atelier',
          tag: 'TRADITIONAL & MODERN',
          rating: 5.0,
          reviews: 88,
          address: '112 Mercer St, New York',
          image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=700&q=80',
          description: 'Combining classic Italian barbering techniques with contemporary styling and signature herbal scalp treatments.',
        },
      ],
    },
    {
      id: 'spa',
      name: 'Spa',
      countText: '35+ Locations',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80',
      description:
        'Rejuvenate mind and body in serene sanctuaries offering thermal hydrotherapy, restorative facials, and holistic wellness therapies.',
      featuredSpots: [
        {
          id: 's-spot-1',
          businessId: 'biz-002',
          name: 'Onyx Sanctuary & Thermal Baths',
          tag: 'LUXURY SPA',
          rating: 4.9,
          reviews: 198,
          address: '88 Franklin St, Tribeca, New York',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
          description: 'Subterranean thermal pools, Finnish cedar saunas, and custom aromatic oils formulated for cellular restoration.',
        },
        {
          id: 's-spot-2',
          businessId: 'biz-002',
          name: 'Aura Thermal & Body Suite',
          tag: 'HOLISTIC WELLNESS',
          rating: 4.8,
          reviews: 115,
          address: '220 West End Ave, New York',
          image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=80',
          description: 'Personalized mineral body wraps, deep tissue botanical infusions, and guided sensory deprivation therapy.',
        },
      ],
    },
    {
      id: 'nails',
      name: 'Nails',
      countText: '42+ Locations',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1600&q=80',
      description:
        'High-concept nail artistry, organic Japanese gel treatments, and meticulous manicure care designed for clean luxury.',
      featuredSpots: [
        {
          id: 'n-spot-1',
          businessId: 'biz-001',
          name: 'L’Atelier De Beauté Nails',
          tag: 'ORGANIC GEL & ART',
          rating: 4.9,
          reviews: 164,
          address: '77 Greene St, SoHo, New York',
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80',
          description: 'Specializing in non-toxic Japanese gels, editorial hand-painted nail designs, and collagen hydration treatments.',
        },
        {
          id: 'n-spot-2',
          businessId: 'biz-001',
          name: 'Nail Lounge NYC',
          tag: 'CLASSIC & MODERN',
          rating: 4.8,
          reviews: 92,
          address: '410 Bleecker St, West Village, NY',
          image: 'https://images.unsplash.com/photo-1519014816548-bf785179c24c?auto=format&fit=crop&w=700&q=80',
          description: 'Relaxed minimalist setting offering Russian dry manicures, keratin cuticle treatments, and crystal embellishments.',
        },
      ],
    },
    {
      id: 'fitness',
      name: 'Fitness',
      countText: '30+ Locations',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=80',
      description:
        'Private personal training suites, elite biomechanical performance labs, and high-intensity boutique fitness spaces.',
      featuredSpots: [
        {
          id: 'f-spot-1',
          businessId: 'biz-002',
          name: 'Kinetic Performance Lab',
          tag: 'ELITE TRAINING',
          rating: 4.9,
          reviews: 130,
          address: '150 Crosby St, New York',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
          description: 'Olympic coaching standards, VO2 max diagnostic analysis, and private strength and conditioning suites.',
        },
        {
          id: 'f-spot-2',
          businessId: 'biz-002',
          name: 'Core Studio Greenwich',
          tag: 'PILATES & MOVEMENT',
          rating: 4.8,
          reviews: 84,
          address: '93 Greenwich Ave, New York',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
          description: 'Reformer Pilates, postural alignment conditioning, and athletic stretch therapy under master instructors.',
        },
      ],
    },
    {
      id: 'wellness',
      name: 'Wellness',
      countText: '25+ Locations',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
      description:
        'Holistic longevity therapies, infrared sauna sessions, cold plunge therapy, and sound resonance meditation.',
      featuredSpots: [
        {
          id: 'w-spot-1',
          businessId: 'biz-002',
          name: 'Zenith Longevity & Wellness',
          tag: 'RECOVERY & SOUND',
          rating: 4.8,
          reviews: 110,
          address: '302 Bowery, East Village, New York',
          image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
          description: 'Tibetan sound bath chambers, medical-grade hyperbaric oxygen therapy, and contrast hydrotherapy circuits.',
        },
        {
          id: 'w-spot-2',
          businessId: 'biz-002',
          name: 'Veda Holistic Haven',
          tag: 'MINDFULNESS',
          rating: 4.9,
          reviews: 75,
          address: '58 E 11th St, New York',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
          description: 'Ayurvedic body consultations, chakra alignment therapy, and custom adaptogenic tea pairings.',
        },
      ],
    },
    {
      id: 'beauty',
      name: 'Beauty',
      countText: '48+ Locations',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      description:
        'Award-winning hair styling, custom balayage, editorial makeup, and clinical skin treatments by master beauty artists.',
      featuredSpots: [
        {
          id: 'bt-spot-1',
          businessId: 'biz-001',
          name: 'Glow Haute Coiffure',
          tag: 'HAIR & STYLING',
          rating: 4.9,
          reviews: 215,
          address: '124 Grand St, SoHo, New York',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
          description: 'Premier salon trusted by fashion editors for dimensional color, precision French cutting, and botanical glosses.',
        },
        {
          id: 'bt-spot-2',
          businessId: 'biz-001',
          name: 'Maison Glow Aesthetics',
          tag: 'FACIAL & SKIN',
          rating: 5.0,
          reviews: 134,
          address: '68 Prince St, New York',
          image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80',
          description: 'Customized lymphatic drainage facials, microcurrent sculpting, and bespoke active enzyme peels.',
        },
      ],
    },
    {
      id: 'tailor',
      name: 'Tailor',
      countText: '16+ Locations',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1600&q=80',
      description:
        'Handcrafted bespoke suiting, precision garment alteration, and custom wardrobe tailoring using English and Italian wools.',
      featuredSpots: [
        {
          id: 't-spot-1',
          businessId: 'biz-001',
          name: 'Savile & Fifth Bespoke',
          tag: 'BESPOKE TAILORING',
          rating: 4.9,
          reviews: 96,
          address: '520 Madison Ave, New York',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80',
          description: 'Three-fitting master tailoring, hand-stitched canvassing, and rare fabric rolls from Loro Piana and Scabal.',
        },
        {
          id: 't-spot-2',
          businessId: 'biz-001',
          name: 'The Garment Workshop',
          tag: 'ALTERATIONS & FIT',
          rating: 4.8,
          reviews: 64,
          address: '28 Bond St, New York',
          image: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=700&q=80',
          description: 'Same-week precision taper, re-lining, and custom fit alterations for designer garments and tuxedos.',
        },
      ],
    },
    {
      id: 'massage',
      name: 'Massage',
      countText: '38+ Locations',
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=80',
      heroImage: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1600&q=80',
      description:
        'Therapeutic deep tissue, Swedish relaxation, prenatal massage, and basalt hot stone therapies by licensed bodyworkers.',
      featuredSpots: [
        {
          id: 'm-spot-1',
          businessId: 'biz-002',
          name: 'Soma Therapeutic Bodywork',
          tag: 'DEEP TISSUE & RECOVERY',
          rating: 4.9,
          reviews: 182,
          address: '142 W 10th St, New York',
          image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=80',
          description: 'Targeted neuromuscular release, myofascial trigger therapies, and custom organic botanical oils.',
        },
        {
          id: 'm-spot-2',
          businessId: 'biz-002',
          name: 'Zenith Restorative Massage',
          tag: 'HOT STONE & RELAX',
          rating: 4.8,
          reviews: 104,
          address: '74 5th Ave, Flatiron, New York',
          image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=80',
          description: 'Heated volcanic stone treatments, warm organic coconut balm, and gentle neck tension decompression.',
        },
      ],
    },
  ];

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const globalLocations = [
    'New York',
    'London',
    'Tokyo',
    'Paris',
    'Dubai',
    'Milan',
    'Singapore',
    'Sydney',
  ];

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
                  Available in 8 Global Locations
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
