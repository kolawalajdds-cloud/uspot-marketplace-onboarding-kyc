import React, { useState } from 'react';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerFooter } from './CustomerFooter';
import { CustomerHomeView } from './CustomerHomeView';
import { CustomerCategoriesView } from './CustomerCategoriesView';
import { CustomerCitiesView } from './CustomerCitiesView';

export const CustomerPortal: React.FC = () => {
  const [activePage, setActivePage] = useState<'home' | 'categories' | 'cities'>('home');

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
          />
        )}
        {activePage === 'categories' && <CustomerCategoriesView />}
        {activePage === 'cities' && <CustomerCitiesView />}
      </main>

      {/* Universal Customer Footer */}
      <CustomerFooter />
    </div>
  );
};
