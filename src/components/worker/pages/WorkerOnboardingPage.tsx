import React, { useState, useRef } from 'react';
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileUp,
  Award,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  X,
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
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guarantee that browser URL is {baseURL}/worker/onboarding
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() !== '/worker/onboarding') {
      window.history.replaceState({ page: 'onboarding' }, '', '/worker/onboarding');
    }
  }, []);

  // Step 1: Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Personal Details
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Step 3: Professional Experience
  const [category, setCategory] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [bio, setBio] = useState('');

  // Step 4: Document Verification
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

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

  // Validation handlers for each step
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep(3);
  };

  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep(4);
  };

  const handleCompleteRegistration = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const skillsArray = [
        category || 'General Maintenance',
        'Safety Verified',
        'Identity Verified',
      ];

      const res = await workerService.onboard({
        fullName: fullName.trim() || 'Jane Doe',
        email: email.trim().toLowerCase() || `worker-${Date.now()}@uspot.com`,
        phone: phone.trim() || '+1 (555) 000-0000',
        primaryServiceCategory: category || 'General Maintenance & Facilities',
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) || 5 : 5,
        hourlyRate: 85,
        payoutBankName: 'Chase Bank Premier',
        payoutRoutingNumber: '021000021',
        payoutAccountNumber: '7712398401',
        skills: skillsArray,
      });

      if (res.success && res.worker) {
        onOnboardingComplete(res.worker);
        onNavigate('dashboard');
      } else {
        setErrorMessage('Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving registration to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-slate-100">
      {/* Top Header Bar matching reference */}
      <header className="w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b border-transparent">
        {/* Brand Logo */}
        <div
          onClick={() => {
            window.location.href = '/';
          }}
          className="text-2xl font-black tracking-tight text-black cursor-pointer select-none"
        >
          URSPOT
        </div>

        {/* Top Right Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-slate-600 hover:text-black transition-colors cursor-pointer"
          >
            Support
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-slate-600 hover:text-black transition-colors cursor-pointer"
          >
            Security
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-slate-600 hover:text-black transition-colors cursor-pointer"
          >
            Help
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-6 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Wizard Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-xl w-full">
          {/* Stepper Progress Bar Header */}
          <div className="mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-black">
              {step === 1 && 'STEP 1 OF 4: ACCOUNT'}
              {step === 2 && 'STEP 2 OF 4: Personal Details'}
              {step === 3 && 'STEP 3 OF 4: Personal Details'}
              {step === 4 && 'STEP 4 OF 4:Document Verification'}
            </div>

            {/* 4 horizontal step dashes */}
            <div className="flex items-center gap-2 mt-3 mb-6">
              <div
                className={`h-1.5 w-7 rounded-full transition-all ${
                  step === 1 ? 'bg-black' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 w-7 rounded-full transition-all ${
                  step === 2 ? 'bg-black' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 w-7 rounded-full transition-all ${
                  step === 3 ? 'bg-black' : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 w-7 rounded-full transition-all ${
                  step === 4 ? 'bg-black' : 'bg-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1: CREATE ACCOUNT (IMAGE 2)                                  */}
          {/* ================================================================= */}
          {step === 1 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Create your account
              </h1>
              <p className="text-sm text-slate-500 mt-1 mb-8">
                Enter your details to get started with the portal.
              </p>

              <form onSubmit={handleStep1Next} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-lg bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-8"
                >
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-sm text-slate-500 mt-6">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="font-bold text-black hover:underline cursor-pointer"
                >
                  Log in instead
                </button>
              </div>

              {/* Secure Registration Callout Card */}
              <div className="mt-8 p-4 rounded-xl border border-slate-200/90 bg-white flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Secure Registration
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Your data is encrypted and managed according to enterprise-grade security
                    standards.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: PERSONAL DETAILS (IMAGE 3)                                */}
          {/* ================================================================= */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Personal Details
              </h1>
              <p className="text-sm text-slate-500 mt-1 mb-8">
                Please provide your contact and residential information.
              </p>

              <form onSubmit={handleStep2Next} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative flex items-center rounded-lg border border-slate-200 px-4 py-2.5 bg-white focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all">
                      <input
                        type="text"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                      />
                      <Calendar className="w-4 h-4 text-slate-700 shrink-0 ml-2" />
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-b border-slate-100 my-6" />

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Home Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="123 Corporate Blvd, Suite 400"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="San Francisco"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          State
                        </label>
                        <select
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all cursor-pointer"
                        >
                          <option value="">Select</option>
                          {usStates.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="94105"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-7 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: PROFESSIONAL EXPERIENCE (IMAGE 4)                         */}
          {/* ================================================================= */}
          {step === 3 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Professional Experience
              </h1>
              <p className="text-sm text-slate-500 mt-1 mb-8">
                Detail your expertise to help us match you with the right opportunities.
              </p>

              <form onSubmit={handleStep3Next} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Service Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your background, key skills, and past achievements..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-7 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: DOCUMENT VERIFICATION (IMAGE 5)                           */}
          {/* ================================================================= */}
          {step === 4 && (
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Document Verification
              </h1>
              <p className="text-sm text-slate-500 mt-1 mb-8">
                Please provide your identification and professional credentials to complete
                your profile.
              </p>

              <div className="space-y-6">
                {/* 1. Identity Verification Dropzone */}
                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Identity Verification
                  </label>
                  <input
                    type="file"
                    ref={idInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIdFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    onClick={() => idInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                      idFile
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-slate-200/90 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                      {idFile ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <FileUp className="w-6 h-6" />
                      )}
                    </div>
                    {idFile ? (
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {idFile.name}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          File loaded ({(idFile.size / 1024).toFixed(1)} KB) • Click to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Supported formats: JPG, PNG, PDF
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Professional License Dropzone */}
                <div>
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Professional License
                  </label>
                  <input
                    type="file"
                    ref={licenseInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLicenseFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    onClick={() => licenseInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                      licenseFile
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-slate-200/90 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                      {licenseFile ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Award className="w-6 h-6" />
                      )}
                    </div>
                    {licenseFile ? (
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {licenseFile.name}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          File loaded ({(licenseFile.size / 1024).toFixed(1)} KB) • Click to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Supported formats: JPG, PNG, PDF
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold tracking-wider uppercase text-slate-800 transition-colors cursor-pointer"
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>SUBMITTING REGISTRATION...</span>
                      </>
                    ) : (
                      <span>COMPLETE REGISTRATION</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
