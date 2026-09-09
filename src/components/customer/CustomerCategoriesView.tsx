import React, { useState } from 'react';
import { Search, Sparkles, Check, ArrowRight } from 'lucide-react';

export const CustomerCategoriesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'hair-styling',
      name: 'Hair Styling & Color',
      tag: '42+ Venues',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'barber-grooming',
      name: 'Barber & Men Grooming',
      tag: '28+ Venues',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'spa-massage',
      name: 'Luxury Spa & Massage',
      tag: '35+ Venues',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'skin-aesthetics',
      name: 'Aesthetics & Dermatology',
      tag: '19+ Venues',
      image: 'https://images.unsplash.com/photo-1512290900672-1f4f5f5c35df?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'nails-brows',
      name: 'Nails, Lashes & Brows',
      tag: '54+ Venues',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'yoga-mindfulness',
      name: 'Yoga, Pilates & Sound',
      tag: '31+ Venues',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'fitness-strength',
      name: 'Personal Training & Gym',
      tag: '22+ Venues',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'dental-holistic',
      name: 'Holistic & Wellness Care',
      tag: '15+ Venues',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Page Header */}
      <section className="pt-16 pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Find Your Dream Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
          Browse our curated selection of top-tier services tailored to your lifestyle. Excellence,
          precision, and ease in every booking.
        </p>

        {/* Category Search Input */}
        <div className="max-w-xl mx-auto relative">
          <div className="rounded-xl border border-slate-200 px-4 py-3 bg-white flex items-center gap-3 shadow-2xs focus-within:border-slate-400 transition-colors">
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

      {/* Grid of 8 Category Cards matching Screenshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Soft Light Gray Placeholder / Skeleton Image Area */}
              <div className="h-44 w-full bg-[#EBECEF] relative overflow-hidden flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Bottom Skeleton / Label Bar matching the screenshot */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-black transition-colors">
                    {cat.name}
                  </span>
                </div>
                {/* Subtle indicator dot / chip matching screenshot */}
                <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-950 transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Don't see your category? Banner (Full Width Dark Block) */}
      <section className="bg-black text-white py-14 px-6 sm:px-12 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Don't see your category?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              We are constantly expanding our partner network. Request a new service or join our
              waiting list for exclusive updates.
            </p>
          </div>

          <form onSubmit={handleRequestSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {requestSent ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-neutral-900 px-5 py-3 rounded-lg border border-emerald-500/30">
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
                  className="w-full sm:w-72 bg-[#121315] border border-neutral-800 text-white text-xs px-4 py-3 rounded-lg placeholder-neutral-500 focus:outline-hidden focus:border-neutral-600 font-medium"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black text-xs font-black tracking-wider px-6 py-3 rounded-lg transition-colors cursor-pointer uppercase whitespace-nowrap shadow-xs"
                >
                  REQUEST
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Category Selection Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCategory}</h3>
                <span className="text-xs text-slate-500">Verified Service Category</span>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Browse top verified professionals and premier venues offering {selectedCategory}{' '}
              with real-time appointment booking.
            </p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full bg-black text-white font-bold text-xs py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Browse Venues in this Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
