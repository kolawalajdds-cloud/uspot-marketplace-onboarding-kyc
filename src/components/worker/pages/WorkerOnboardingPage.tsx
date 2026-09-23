import React, { useState } from 'react';
import {
  User,
  Wrench,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { workerService } from '../../../services/api/marketplaceApi';
import { UserProfile } from '../../../types';

interface WorkerOnboardingPageProps {
  onOnboardingComplete: (worker: UserProfile) => void;
  onNavigate: (page: string) => void;
}

export const WorkerOnboardingPage: React.FC<WorkerOnboardingPageProps> = ({
  onOnboardingComplete,
  onNavigate,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('General Maintenance & Facilities');
  const [experience, setExperience] = useState('5');
  const [hourlyRate, setHourlyRate] = useState('85');
  const [skillsText, setSkillsText] = useState('HVAC, Electrical, Plumbing, Safety Certified');
  const [bankName, setBankName] = useState('Chase Premier Business');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [accountNumber, setAccountNumber] = useState('7712398401');
  const [signature, setSignature] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const categories = [
    'General Maintenance & Facilities',
    'Hair & Salon Specialist',
    'Spa & Wellness Technician',
    'HVAC & Climate Control',
    'Electrical & Wiring',
    'Commercial Plumbing',
    'Carpentry & Assembly',
    'Sanitation & Deep Cleaning',
  ];

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1 && (!fullName || !email)) {
      setErrorMessage('Please provide your full name and email.');
      return;
    }
    if (step === 3 && (!bankName || !routingNumber || !accountNumber)) {
      setErrorMessage('Please complete all banking payout fields.');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !signature) {
      setErrorMessage('Please agree to terms and provide your digital signature.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await workerService.onboard({
        fullName,
        email,
        phone,
        primaryServiceCategory: category,
        yearsOfExperience: experience,
        hourlyRate: parseFloat(hourlyRate) || 85,
        payoutBankName: bankName,
        payoutRoutingNumber: routingNumber,
        payoutAccountNumber: accountNumber,
        skills: skillsArray,
      });

      if (res.success && res.worker) {
        onOnboardingComplete(res.worker);
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight">URSPOT Worker Onboarding</span>
            <p className="text-[11px] text-slate-400">Step {step} of 4: Setup your certified worker profile</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer"
        >
          Back to Login
        </button>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl w-full mx-auto my-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Step Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { num: 1, label: 'Profile', icon: User },
              { num: 2, label: 'Trade & Skills', icon: Wrench },
              { num: 3, label: 'Payout Setup', icon: CreditCard },
              { num: 4, label: 'Terms & Sign', icon: FileCheck },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="text-center">
                  <div
                    className={`h-1.5 rounded-full mb-2 transition-all ${
                      isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-500' : 'bg-slate-800'
                    }`}
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isCompleted ? 'text-emerald-400' : isActive ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    />
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-white mb-1">Personal & Contact Information</h2>
              <p className="text-xs text-slate-400 mb-4">
                This information identifies you to businesses when you are assigned to jobs and shifts.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Morgan Blake"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. morgan@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Trade & Skills */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-white mb-1">Specialization & Experience</h2>
              <p className="text-xs text-slate-400 mb-4">
                Select your primary trade category and default hourly rate for on-demand dispatch.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Primary Trade Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    min="1"
                    max="40"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Standard Hourly Rate ($/hr)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="25"
                    max="300"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Skills & Certifications (Comma-separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. Master Electrician, EPA 608, OSHA 30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Banking & Payout */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-white mb-1">Direct Deposit & Payout Setup</h2>
              <p className="text-xs text-slate-400 mb-4">
                Link your bank account to receive automatic ACH payouts for completed jobs.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Routing Number (9 Digits)</label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    maxLength={9}
                    placeholder="021000021"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Number</label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="•••• •••• ••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Encrypted 256-bit ACH storage. Payouts processed every Tuesday and Friday.</span>
              </div>
            </div>
          )}

          {/* STEP 4: Terms & Sign */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h2 className="text-lg font-bold text-white mb-1">Independent Specialist Agreement</h2>
              <p className="text-xs text-slate-400 mb-4">
                Please review and execute the UrSpot Master Independent Contractor Terms.
              </p>

              <div className="h-40 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>1. Independent Contractor Relationship:</strong> The Worker acknowledges and agrees that they are
                  an independent contractor and not an employee of UrSpot or any host merchant business.
                </p>
                <p>
                  <strong>2. Compensation & Payouts:</strong> Earnings are disbursed based on validated check-ins and
                  customer sign-off check-outs. Platform withholding complies with applicable IRS 1099 standards.
                </p>
                <p>
                  <strong>3. Safety & Performance:</strong> The Worker agrees to maintain all necessary professional
                  certifications, safety equipment, and standards of conduct while on premises.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                  <span>I agree to the Master Specialist Terms and understand 1099 tax status.</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Digital Signature (Type Full Name)</label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="e.g. Morgan Blake"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-serif text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-xs font-bold text-white px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Onboarding & Access Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-2 text-[11px] text-slate-500">
        URSPOT Marketplace &copy; 2026. Certified Specialist Program.
      </footer>
    </div>
  );
};
