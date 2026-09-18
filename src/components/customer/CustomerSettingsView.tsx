import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Calendar,
  User,
  MapPin,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Info,
  Building,
  ArrowRight,
  Bell,
  Smartphone,
  Mail,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { CustomerSavedCard } from '../../types';

interface CustomerSettingsViewProps {
  onNavigateHome?: () => void;
  onNavigateBookings?: () => void;
}

export const CustomerSettingsView: React.FC<CustomerSettingsViewProps> = ({
  onNavigateHome,
  onNavigateBookings,
}) => {
  const {
    currentUser,
    customerSavedCards,
    addCustomerSavedCard,
    removeCustomerSavedCard,
    setDefaultCustomerSavedCard,
  } = useDemo();

  const [activeTab, setActiveTab] = useState<'payment' | 'profile' | 'notifications'>('payment');

  // Modal State
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CustomerSavedCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add Card
  const [cardholderName, setCardholderName] = useState(currentUser?.fullName || 'Alex Taylor');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(customerSavedCards.length === 0);
  const [street, setStreet] = useState('142 Franklin Street, Apt 4B');
  const [city, setCity] = useState('New York');
  const [stateVal, setStateVal] = useState('NY');
  const [zip, setZip] = useState('10013');
  const [country, setCountry] = useState('United States');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.fullName || 'Alex Taylor');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'alex_shopper@uspot.com');
  const [profilePhone, setProfilePhone] = useState('+1 (555) 234-5678');
  const [oneClickCheckout, setOneClickCheckout] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Detect card brand from number
  const detectBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) {
      return 'mastercard';
    }
    if (clean.startsWith('6011') || clean.startsWith('65')) return 'discover';
    return 'mastercard';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Add spaces every 4 digits
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 15) {
      setFormError('Please enter a valid 15 or 16 digit card number.');
      return;
    }

    const expParts = expiry.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      setFormError('Please enter a valid expiry date (MM/YY).');
      return;
    }

    if (cvv.length < 3) {
      setFormError('Please enter a valid CVV/CVC code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const brand = detectBrand(cleanNum);
      const last4 = cleanNum.slice(-4);

      addCustomerSavedCard({
        customer_id: currentUser?.id || 'user-customer',
        cardholder_name: cardholderName.trim() || 'Cardholder',
        brand,
        last4,
        exp_month: expParts[0],
        exp_year: expParts[1],
        is_default: isDefault,
        billing_address: {
          street,
          city,
          state: stateVal,
          zip,
          country,
        },
      });

      setIsSubmitting(false);
      setIsAddCardOpen(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      showToast(`${brand.toUpperCase()} ending in ${last4} has been saved securely.`);
    }, 600);
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;
    removeCustomerSavedCard(cardToDelete.id);
    showToast(`Card ending in ${cardToDelete.last4} has been removed.`);
    setCardToDelete(null);
  };

  const activeCardBrand = detectBrand(cardNumber);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Customer Portal</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Settings</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Account & Payment Settings
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your saved payment methods, card details, personal profile, and checkout preferences.
              </p>
            </div>

            {activeTab === 'payment' && (
              <button
                onClick={() => setIsAddCardOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'payment'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Saved Cards & Payment</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-extrabold">
              {customerSavedCards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Contact</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Checkout Preferences</span>
          </button>
        </div>

        {/* TAB 1: SAVED CARDS & PAYMENT METHODS */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Quick Info / Security Banner */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Encrypted Payment Vault (PCI-DSS Level 1)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your card numbers are tokenized directly with NMI Payment Gateway. We never store
                    unencrypted numbers or security codes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Saved Cards Grid */}
            {customerSavedCards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No payment cards saved yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add your credit or debit card for faster, one-click booking across all salon, spa,
                  and wellness marketplace providers.
                </p>
                <button
                  onClick={() => setIsAddCardOpen(true)}
                  className="mt-5 px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  + Add First Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customerSavedCards.map((card) => {
                  const isMastercard = card.brand === 'mastercard';
                  const isVisa = card.brand === 'visa';
                  const isAmex = card.brand === 'amex';

                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      {/* Realistic Visual Card Graphic */}
                      <div
                        className={`p-6 text-white relative overflow-hidden ${
                          isMastercard
                            ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950'
                            : isVisa
                            ? 'bg-gradient-to-tr from-blue-950 via-blue-900 to-slate-900'
                            : 'bg-gradient-to-tr from-zinc-900 via-stone-900 to-slate-800'
                        }`}
                      >
                        {/* Decorative background glow */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

                        {/* Top row: Chip & Brand */}
                        <div className="flex items-center justify-between relative z-10 mb-6">
                          {/* Metallic Chip */}
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400/80 flex items-center justify-center shadow-xs">
                            <div className="w-7 h-4 border-t border-b border-amber-600/40" />
                          </div>

                          {/* Brand Logo & Default Badge */}
                          <div className="flex items-center gap-2">
                            {card.is_default && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Default
                              </span>
                            )}
                            <span className="text-sm font-black tracking-wider uppercase">
                              {card.brand}
                            </span>
                          </div>
                        </div>

                        {/* Card Number */}
                        <div className="relative z-10 mb-6 font-mono text-lg tracking-[0.2em] font-medium text-white/90">
                          •••• •••• •••• {card.last4}
                        </div>

                        {/* Bottom Row: Holder & Expiry */}
                        <div className="flex items-end justify-between relative z-10 text-xs">
                          <div>
                            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-bold">
                              Cardholder
                            </span>
                            <span className="font-bold tracking-wide uppercase text-white/90">
                              {card.cardholder_name}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-bold">
                              Expires
                            </span>
                            <span className="font-mono font-bold text-white/90">
                              {card.exp_month}/{card.exp_year}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Details & Actions Footer */}
                      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-slate-500">
                          {card.billing_address?.city ? (
                            <span>
                              Billing: {card.billing_address.city}, {card.billing_address.state}{' '}
                              {card.billing_address.zip}
                            </span>
                          ) : (
                            <span>Registered Card</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!card.is_default && (
                            <button
                              type="button"
                              onClick={() => setDefaultCustomerSavedCard(card.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setCardToDelete(card)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Remove card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compliance Guarantee Cards (3-Col Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Liability Guarantee</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    You are never held responsible for unauthorized transactions on your saved payment cards.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tokenized Vault</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Raw card details are vaulted with NMI. Only secure authorization tokens are stored.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <Building className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Marketplace Protection</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automated escrow and instant refunds in case of appointment cancellation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & CONTACT */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This information is shared with providers when you confirm an appointment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Primary Marketplace Location
                </label>
                <input
                  type="text"
                  defaultValue="Tribeca, New York, NY"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('Profile details updated successfully.')}
                className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & CHECKOUT PREFERENCES */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Checkout & Alert Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize how your saved payment methods are used during marketplace checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">1-Click Instant Checkout</div>
                  <div className="text-xs text-slate-500">
                    Automatically use your default saved card when booking verified salon & spa slots.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={oneClickCheckout}
                  onChange={(e) => {
                    setOneClickCheckout(e.target.checked);
                    showToast(`1-Click Checkout ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-5 h-5 rounded text-black focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">Email Invoices & Receipts</div>
                  <div className="text-xs text-slate-500">
                    Receive official PDF receipts and transaction records immediately upon card settlement.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailReceipts}
                  onChange={(e) => {
                    setEmailReceipts(e.target.checked);
                    showToast(`Email receipts ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-5 h-5 rounded text-black focus:ring-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">SMS Booking & Refund Alerts</div>
                  <div className="text-xs text-slate-500">
                    Receive text messages for upcoming appointments and instant refund processing status.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsReminders}
                  onChange={(e) => {
                    setSmsReminders(e.target.checked);
                    showToast(`SMS notifications ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-5 h-5 rounded text-black focus:ring-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW CARD WITH LIVE REACTIVE PREVIEW */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Save Payment Card</h3>
                <p className="text-xs text-slate-500">
                  Card details are encrypted with bank-grade security.
                </p>
              </div>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE CARD PREVIEW */}
            <div
              className={`p-6 rounded-2xl text-white relative overflow-hidden shadow-lg transition-all ${
                activeCardBrand === 'mastercard'
                  ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950'
                  : activeCardBrand === 'visa'
                  ? 'bg-gradient-to-tr from-blue-950 via-blue-900 to-slate-900'
                  : 'bg-gradient-to-tr from-zinc-900 via-stone-900 to-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-9 h-6 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/80" />
                <span className="text-sm font-black uppercase tracking-wider">
                  {activeCardBrand}
                </span>
              </div>
              <div className="font-mono text-base tracking-[0.2em] mb-6 text-white/90">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-[9px] text-white/50 uppercase block">Cardholder</span>
                  <span className="font-bold uppercase tracking-wide">
                    {cardholderName || 'FULL NAME'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/50 uppercase block">Expires</span>
                  <span className="font-mono font-bold">{expiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Card Form */}
            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Taylor"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 •••• •••• ••••"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1 flex items-center justify-between">
                    <span>CVV / CVC</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">3-4 digits</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Billing Address Sub-section */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Billing Address
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      className="rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="rounded-xl border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-slate-900"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Set as default payment card for future bookings
                </span>
              </label>

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Encrypting & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Save Card Securely</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Payment Card?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete your {cardToDelete.brand.toUpperCase()} ending in{' '}
                <span className="font-mono font-bold text-slate-800">{cardToDelete.last4}</span>?
                You will need to re-enter it for future bookings.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow cursor-pointer"
              >
                Yes, Remove Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
