import React, { useState, useMemo } from 'react';
import { useDemo } from '../../../context/DemoContext';
import { CustomerRecord, INITIAL_CUSTOMERS } from '../../../data/customerData';
import {
  Users,
  Search,
  Plus,
  Building2,
  UserCheck,
  Calendar,
  Star,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  Globe,
  LogIn,
  Edit2,
  Trash2,
  X,
  Shield,
  Activity,
  Award,
  DollarSign,
} from 'lucide-react';

type UserSubTab = 'customers' | 'partners' | 'staff';

export interface AdminUsersTabProps {
  currentSubTab?: UserSubTab;
  onSubTabChange?: (tab: UserSubTab) => void;
  hideInternalNav?: boolean;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  currentSubTab,
  onSubTabChange,
  hideInternalNav = false,
}) => {
  const { users, currentUser, loginAsUser, toggleUserStatus, deleteUserById } = useDemo();

  // Tab State - DEFAULT IS 'customers'
  const [internalTab, setInternalTab] = useState<UserSubTab>('customers');
  const activeTab = currentSubTab !== undefined ? currentSubTab : internalTab;

  const setActiveTab = (tab: UserSubTab) => {
    setInternalTab(tab);
    onSubTabChange?.(tab);
  };

  // Customer List State
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);

  // Customer Filters
  const [searchCustomer, setSearchCustomer] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [countryFilter, setCountryFilter] = useState('United Kingdom');
  const [dateRange, setDateRange] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('All Statuses');
  const [appliedCountry, setAppliedCountry] = useState('United Kingdom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'spend' | 'bookings'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustTier, setNewCustTier] = useState<'Standard Member' | 'Premium Member' | 'VIP Member'>('Standard Member');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+44 7700 ');
  const [newCustCountry, setNewCustCountry] = useState('United Kingdom');
  const [newCustSpend, setNewCustSpend] = useState<number>(0);
  const [newCustBookings, setNewCustBookings] = useState<number>(0);

  // Partner & Staff Search / Filter
  const [partnerSearch, setPartnerSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Partners list from demo context
  const partnerUsers = users.filter((u) => u.role === 'business');
  // Staff list from demo context
  const staffUsers = users.filter((u) => u.role === 'specialist');

  // Apply customer filters
  const handleApplyFilters = () => {
    setAppliedSearch(searchCustomer);
    setAppliedStatus(statusFilter);
    setAppliedCountry(countryFilter);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchCustomer('');
    setStatusFilter('All Statuses');
    setCountryFilter('All Countries');
    setDateRange('');
    setAppliedSearch('');
    setAppliedStatus('All Statuses');
    setAppliedCountry('All Countries');
    setCurrentPage(1);
  };

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === 'asc') return 'desc';
      if (prev === 'desc') return 'spend';
      if (prev === 'spend') return 'bookings';
      return 'asc';
    });
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'asc': return 'Sort: A–Z';
      case 'desc': return 'Sort: Z–A';
      case 'spend': return 'Sort: Spend (High)';
      case 'bookings': return 'Sort: Bookings (High)';
    }
  };

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    if (appliedStatus !== 'All Statuses') {
      result = result.filter((c) => c.status === appliedStatus);
    }

    if (appliedCountry !== 'All Countries') {
      result = result.filter((c) => c.country === appliedCountry);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'desc') return b.name.localeCompare(a.name);
      if (sortOrder === 'spend') return b.spend - a.spend;
      if (sortOrder === 'bookings') return b.bookings - a.bookings;
      return 0;
    });

    return result;
  }, [customers, appliedSearch, appliedStatus, appliedCountry, sortOrder]);

  const totalResultsCount = 2450; // Total platform registered matching screenshot
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Add Customer Form Submit
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;

    const nextIdNum = Math.floor(1000 + Math.random() * 9000);
    const loyaltyPts = Math.round((newCustSpend || 100) * 2);
    const coinsVal = Math.round(loyaltyPts / 20);

    const created: CustomerRecord = {
      id: `#CST-${nextIdNum}`,
      name: newCustName.trim(),
      membershipTier: newCustTier,
      email: newCustEmail.trim(),
      phone: newCustPhone.trim(),
      country: newCustCountry,
      bookings: Number(newCustBookings) || 1,
      spend: Number(newCustSpend) || 250,
      reviews: 1,
      loyaltyPoints: loyaltyPts,
      coins: coinsVal,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setCustomers([created, ...customers]);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('+44 7700 ');
    setNewCustSpend(0);
    setNewCustBookings(0);
  };

  return (
    <div id="admin-users-management" className="space-y-6 animate-in fade-in duration-150">
      {/* 3 Top Sub-Navigation Tabs: Customers, Partners, Staff */}
      {!hideInternalNav && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 w-fit">
          <button
            id="subtab-customers-btn"
            onClick={() => setActiveTab('customers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'customers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-slate-700" />
            <span>Customers</span>
          </button>

          <button
            id="subtab-partners-btn"
            onClick={() => setActiveTab('partners')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'partners'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Partners</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/70 text-slate-700 font-mono">
              {partnerUsers.length}
            </span>
          </button>

          <button
            id="subtab-staff-btn"
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Staff</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/70 text-slate-700 font-mono">
              {staffUsers.length}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CUSTOMERS TAB (EXACTLY MATCHING USER'S SCREENSHOT) */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div id="customers-view-container" className="space-y-6">
          {/* Header Row: Title, Subtitle, and "+ Add New Customer" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Customers</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage platform customers, loyalty programs, and booking histories.
              </p>
            </div>

            <button
              id="add-customer-top-btn"
              onClick={() => setIsAddCustomerOpen(true)}
              className="bg-black hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Customer</span>
            </button>
          </div>

          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            {/* Top row of filters: Search Customer, Status, Country, Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Search Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search Customer
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Name, Email, Phone..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* 2. Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* 3. Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country
                </label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="All Countries">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>

              {/* 4. Date Range */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date Range
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select dates"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bottom row of filters: Apply Filters, Reset, and Sort A-Z */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={toggleSort}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{getSortLabel()}</span>
              </button>
            </div>
          </div>

          {/* Customers Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5">ID</th>
                    <th className="py-3.5 px-4">NAME</th>
                    <th className="py-3.5 px-4">CONTACT</th>
                    <th className="py-3.5 px-4 text-center">BOOKINGS</th>
                    <th className="py-3.5 px-4 text-right">SPEND</th>
                    <th className="py-3.5 px-4 text-center">REVIEWS</th>
                    <th className="py-3.5 px-4">LOYALTY</th>
                    <th className="py-3.5 px-5 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        No customers match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-5 font-mono text-slate-400 font-medium">
                          {cust.id}
                        </td>

                        {/* Name + Subtitle */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {cust.name}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              {cust.membershipTier}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="text-slate-800 font-medium block">
                              {cust.email}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                              {cust.phone}
                            </span>
                          </div>
                        </td>

                        {/* Bookings */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                          {cust.bookings}
                        </td>

                        {/* Spend */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                          £{cust.spend.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Reviews */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{cust.reviews}</span>
                          </span>
                        </td>

                        {/* Loyalty */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {cust.loyaltyPoints.toLocaleString()} Pts
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              {cust.coins} Coins
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                              cust.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing 1–{paginatedCustomers.length} of{' '}
                <strong className="text-slate-900 font-bold">{totalResultsCount.toLocaleString()}</strong> results
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    currentPage === 1 ? 'bg-black text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    currentPage === 2 ? 'bg-black text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    currentPage === 3 ? 'bg-black text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(245)}
                  className={`w-8 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    currentPage === 245 ? 'bg-black text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  245
                </button>
                <button
                  disabled={currentPage >= 245}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Bottom 4 Metric Cards (Exact match to screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL LOYALTY ISSUED */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                TOTAL LOYALTY ISSUED
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">12.4M Pts</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>+12% this month</span>
              </div>
            </div>

            {/* Card 2: AVG. REVIEW SCORE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                AVG. REVIEW SCORE
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">4.82</div>
              <div className="flex items-center gap-0.5 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Card 3: CHURN RATE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                CHURN RATE
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">1.4%</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-3">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>-0.2% vs last year</span>
              </div>
            </div>

            {/* Card 4: ACTIVE USERS NOW */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                ACTIVE USERS NOW
              </span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">142</div>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-time engagement</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PARTNERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'partners' && (
        <div id="partners-view-container" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Partners (Merchants)</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage venue operators, landlords, and commercial space providers.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search partners by name, email..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Partner & Venue</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timezone</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partnerUsers
                  .filter(
                    (p) =>
                      p.fullName.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                      p.email.toLowerCase().includes(partnerSearch.toLowerCase()) ||
                      (p.department && p.department.toLowerCase().includes(partnerSearch.toLowerCase()))
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {p.avatarInitials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{p.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">@{p.username}</span>
                            {p.department && (
                              <span className="text-[10px] text-blue-600 font-medium block">{p.department}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-slate-800 font-medium block">{p.email}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{p.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleUserStatus(p.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span className="capitalize">{p.status}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {p.timezone}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => loginAsUser(p.username)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Switch Session</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STAFF TAB */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div id="staff-view-container" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Staff & Specialists</h1>
              <p className="text-xs text-slate-500 mt-1">
                KYC compliance officers, operations specialists, and support administrators.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search staff..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timezone</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers
                  .filter(
                    (s) =>
                      s.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      (s.department && s.department.toLowerCase().includes(staffSearch.toLowerCase()))
                  )
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center">
                            {s.avatarInitials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{s.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">@{s.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200/60">
                          {s.department || 'KYC Compliance'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-slate-800 font-medium block">{s.email}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{s.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleUserStatus(s.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                            s.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span className="capitalize">{s.status}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {s.timezone}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => loginAsUser(s.username)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Switch Session</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddCustomerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
                <p className="text-xs text-slate-500">Provision a registered customer record and loyalty account</p>
              </div>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Membership Tier</label>
                  <select
                    value={newCustTier}
                    onChange={(e) => setNewCustTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Standard Member">Standard Member</option>
                    <option value="Premium Member">Premium Member</option>
                    <option value="VIP Member">VIP Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <select
                    value={newCustCountry}
                    onChange={(e) => setNewCustCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. eleanor@example.co.uk"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+44 7700 900123"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Historical Spend (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newCustSpend}
                    onChange={(e) => setNewCustSpend(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Bookings</label>
                  <input
                    type="number"
                    min="0"
                    value={newCustBookings}
                    onChange={(e) => setNewCustBookings(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
