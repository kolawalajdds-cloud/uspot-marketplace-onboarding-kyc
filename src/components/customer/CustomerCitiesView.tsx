import React, { useState } from 'react';
import { Search, MapPin, Check, Building2 } from 'lucide-react';

export const CustomerCitiesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [whitelistEmail, setWhitelistEmail] = useState('');
  const [whitelistJoined, setWhitelistJoined] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);

  const majorCities = [
    {
      name: 'New York',
      country: 'United States',
      spots: '42+ Locations',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'London',
      country: 'United Kingdom',
      spots: '215+ Locations',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      spots: '310+ Locations',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Paris',
      country: 'France',
      spots: '180+ Locations',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Berlin',
      country: 'Germany',
      spots: '95+ Locations',
      image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      spots: '140+ Locations',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const filteredCities = majorCities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWhitelistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistEmail) return;
    setWhitelistJoined(true);
    setTimeout(() => {
      setWhitelistJoined(false);
      setWhitelistEmail('');
    }, 2500);
  };

  return (
    <div className="w-full bg-white animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Header with Search and Geometric Building Skyline */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 pb-14 border-b border-slate-100">
          {/* Left: Headline & Search */}
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
              Explore our Locations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 font-normal">
              Discover the premier urban spots and professional services across the world's most
              vibrant metropolises. Managed excellence, delivered locally.
            </p>

            {/* Search bar with Find button */}
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a city (e.g. New York, London...)"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
                />
              </div>
              <button
                type="button"
                className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Find
              </button>
            </div>
          </div>

          {/* Right: Light gray geometric illustration of city buildings (matching screenshot) */}
          <div className="relative w-72 h-56 flex items-center justify-center opacity-80 select-none">
            <svg
              className="w-full h-full text-slate-200 fill-current"
              viewBox="0 0 280 220"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background high-rise */}
              <polygon points="170,30 210,30 210,210 170,210" fill="#F1F3F5" />
              {/* Center building with peaked roof like screenshot */}
              <polygon points="140,50 170,20 200,50 200,210 140,210" fill="#E8EBED" />
              {/* Windows grid on building */}
              <rect x="150" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="174" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="150" y="98" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="174" y="98" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="150" y="126" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="174" y="126" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="150" y="154" width="16" height="16" rx="2" fill="#FFFFFF" />
              <rect x="174" y="154" width="16" height="16" rx="2" fill="#FFFFFF" />

              {/* Foreground building right */}
              <polygon points="200,85 240,85 240,210 200,210" fill="#F1F3F5" />
              <rect x="210" y="105" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="210" y="135" width="18" height="18" rx="2" fill="#FFFFFF" />
              <rect x="210" y="165" width="18" height="18" rx="2" fill="#FFFFFF" />

              {/* Foreground building left */}
              <polygon points="90,110 140,110 140,210 90,210" fill="#EEF0F2" />
              <rect x="102" y="125" width="14" height="14" rx="2" fill="#FFFFFF" />
              <rect x="120" y="125" width="14" height="14" rx="2" fill="#FFFFFF" />
              <rect x="102" y="150" width="14" height="14" rx="2" fill="#FFFFFF" />
              <rect x="120" y="150" width="14" height="14" rx="2" fill="#FFFFFF" />
            </svg>
          </div>
        </section>

        {/* Content Section matching screenshot */}
        <section className="py-16">
          {showLoadingState ? (
            <div className="py-20 text-center">
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                Loading cities...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Optional switch to preview "Loading cities..." exactly as captured in screenshot */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Featured Metropolises ({filteredCities.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowLoadingState(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Show loading state
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map((city, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="text-lg font-bold leading-tight">{city.name}</h3>
                        <span className="text-xs text-slate-200">{city.country}</span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between text-xs bg-white">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {city.spots}
                      </span>
                      <span className="text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                        Explore →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Stay updated on new cities Banner (Black rounded block matching screenshot) */}
        <section className="bg-black text-white rounded-3xl p-8 sm:p-12 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 my-6">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Stay updated on new cities
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              We are expanding rapidly. Join our whitelist to be the first to know when URSPOT arrives
              in your metropolis.
            </p>
          </div>

          <form onSubmit={handleWhitelistSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {whitelistJoined ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-neutral-900 px-5 py-3 rounded-lg border border-emerald-500/30">
                <Check className="w-4 h-4" />
                <span>Added to city whitelist!</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={whitelistEmail}
                  onChange={(e) => setWhitelistEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-72 bg-[#121315] border border-neutral-800 text-white text-xs px-4 py-3 rounded-lg placeholder-neutral-500 focus:outline-hidden focus:border-neutral-600 font-medium"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black text-xs font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Join Whitelist
                </button>
              </>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};
