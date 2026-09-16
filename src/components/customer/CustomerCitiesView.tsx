import React, { useState, useMemo } from 'react';
import { Search, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface CustomerCitiesViewProps {
  onSelectSpotDetail: (businessId: string) => void;
  onBookSpot: (businessId: string, serviceId?: string) => void;
}

interface CitySpotCard {
  id: string;
  businessId: string;
  name: string;
  categoryBadge: 'BARBER' | 'SPA' | 'BEAUTY' | 'WELLNESS' | 'MASSAGE';
  rating: number;
  neighborhood: string;
  image: string;
}

export const CustomerCitiesView: React.FC<CustomerCitiesViewProps> = ({
  onSelectSpotDetail,
  onBookSpot,
}) => {
  const { state } = useDemo();

  const [activeCity, setActiveCity] = useState('New York City');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categoryPills = ['All', 'Barber', 'Beauty', 'Spa', 'Wellness', 'Massage'];

  // 8 Spot cards matching Image 1 using our given data
  const spots: CitySpotCard[] = useMemo(() => [
    {
      id: 'spot-1',
      businessId: 'biz-001', // Glow Salon / The Groomer
      name: 'Empire Grooming',
      categoryBadge: 'BARBER',
      rating: 4.9,
      neighborhood: 'Manhattan, NY',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-2',
      businessId: 'biz-002', // Onyx Spa & Wellness
      name: 'Zenith Sanctuary',
      categoryBadge: 'SPA',
      rating: 4.8,
      neighborhood: 'Brooklyn, NY',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-3',
      businessId: 'biz-001',
      name: 'Noir Beauty Bar',
      categoryBadge: 'BEAUTY',
      rating: 5.0,
      neighborhood: 'SoHo, NY',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-4',
      businessId: 'biz-002',
      name: 'Urban Reset',
      categoryBadge: 'WELLNESS',
      rating: 4.7,
      neighborhood: 'Chelsea, NY',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-5',
      businessId: 'biz-001',
      name: 'The Glam Lab',
      categoryBadge: 'BEAUTY',
      rating: 4.9,
      neighborhood: 'Queens, NY',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-6',
      businessId: 'biz-001',
      name: 'Prestige Cuts',
      categoryBadge: 'BARBER',
      rating: 4.6,
      neighborhood: 'Upper East Side, NY',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-7',
      businessId: 'biz-002',
      name: 'The Kinetic Studio',
      categoryBadge: 'MASSAGE',
      rating: 4.9,
      neighborhood: 'Tribeca, NY',
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'spot-8',
      businessId: 'biz-001',
      name: 'Glow Clinic',
      categoryBadge: 'BEAUTY',
      rating: 4.5,
      neighborhood: 'Williamsburg, NY',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80',
    },
  ], []);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // Category filter
      if (activeCategoryPill !== 'All') {
        if (spot.categoryBadge.toLowerCase() !== activeCategoryPill.toLowerCase()) {
          return false;
        }
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(q);
        const matchCat = spot.categoryBadge.toLowerCase().includes(q);
        const matchLoc = spot.neighborhood.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchLoc) return false;
      }
      return true;
    });
  }, [spots, activeCategoryPill, searchQuery]);

  return (
    <div className="w-full bg-white py-10 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* City Title matching Image 1 */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {activeCity}
          </h1>
        </div>

        {/* Search Bar matching Image 1 */}
        <div className="w-full max-w-2xl">
          <div className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:border-slate-400 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for grooming, beauty, or spa..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Filter Pills matching Image 1 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categoryPills.map((pill) => {
            const isActive = activeCategoryPill === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setActiveCategoryPill(pill)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-[#F2F4F7] text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* 4-Column Grid of 8 Spot Cards matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              onClick={() => onSelectSpotDetail(spot.businessId)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
            >
              {/* Image Container with Badge */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                {/* Category Badge matching Image 1 */}
                <div className="absolute top-3 left-3 bg-white/95 text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                  {spot.categoryBadge}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-black text-black" />
                      <span>{spot.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{spot.neighborhood}</span>
                  </div>
                </div>

                {/* Book Now Button matching Image 1 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookSpot(spot.businessId);
                  }}
                  className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls matching Image 1 */}
        <div className="pt-10 pb-4 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5 font-bold">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === page ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              onClick={() => setCurrentPage(12)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 12 ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              12
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(12, p + 1))}
            disabled={currentPage === 12}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
