import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import {
  User,
  Building2,
  Mail,
  Lock,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface RegisterWizardProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { registerUser } = useDemo();

  // Current wizard step: 1 = Account Type, 2 = Credentials, 3 = Personal Info
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account Type Selection ('personal' or 'business')
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

  // Step 2: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3: Personal Information (Customer & Vendor)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Password strength calculation (0 to 4 bars)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  const getStrengthBarColor = (index: number) => {
    if (index >= passwordScore) return 'bg-slate-200';
    if (passwordScore === 1) return 'bg-rose-500';
    if (passwordScore === 2) return 'bg-amber-500';
    if (passwordScore === 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  // Step 1 -> Step 2 transition
  const handleNextStep1 = () => {
    setErrors({});
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 transition
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email =
        accountType === 'business' ? 'Work email is required' : 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password =
        accountType === 'personal'
          ? 'Enter at least 8 characters'
          : 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirming password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(3);
  };

  // Handle reCAPTCHA click with interactive feedback
  const handleCaptchaClick = () => {
    if (isRobotVerified) {
      setIsRobotVerified(false);
      return;
    }
    setIsVerifyingCaptcha(true);
    setTimeout(() => {
      setIsVerifyingCaptcha(false);
      setIsRobotVerified(true);
      if (errors.captcha) {
        setErrors((prev) => ({ ...prev, captcha: '' }));
      }
    }, 450);
  };

  // Step 3: Final registration submission to database
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName =
        accountType === 'personal' ? 'First name is required' : 'Legal first name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName =
        accountType === 'personal' ? 'Last name is required' : 'Legal last name is required';
    }

    // Customer specific validations
    if (accountType === 'personal') {
      if (!isRobotVerified) {
        newErrors.captcha = 'Please confirm you are not a robot';
      }
    } else {
      // Vendor specific validations
      if (!agreedToTerms) {
        newErrors.agreedToTerms =
          'You must agree to the Terms of Service and Privacy Policy to continue';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setIsSubmitting(true);

    try {
      await registerUser({
        accountType,
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        marketingOptIn,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-4 font-sans animate-in fade-in duration-300">
      {/* ==================================================================== */}
      {/* 3-STEP PROGRESS STEPPER                                               */}
      {/* ==================================================================== */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Step 1 Node */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 1
                  ? 'bg-black text-white'
                  : currentStep === 1
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-2 transition-colors ${
                currentStep === 1 ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
              }`}
            >
              Account Type
            </span>
          </div>

          {/* Line Between Step 1 and Step 2 */}
          <div
            className={`h-0.5 flex-1 mx-3 sm:mx-6 transition-colors duration-300 -mt-5 ${
              currentStep >= 2 ? 'bg-black' : 'bg-slate-200'
            }`}
          />

          {/* Step 2 Node */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep > 2
                  ? 'bg-black text-white'
                  : currentStep === 2
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-2 transition-colors ${
                currentStep === 2 ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
              }`}
            >
              Credentials
            </span>
          </div>

          {/* Line Between Step 2 and Step 3 */}
          <div
            className={`h-0.5 flex-1 mx-3 sm:mx-6 transition-colors duration-300 -mt-5 ${
              currentStep >= 3 ? 'bg-black' : 'bg-slate-200'
            }`}
          />

          {/* Step 3 Node */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === 3
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-2 transition-colors ${
                currentStep === 3 ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
              }`}
            >
              Personal Info
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN CARD CONTAINER                                                  */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 transition-all">
        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: CHOOSE YOUR ACCOUNT TYPE (Common to Both)                    */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Choose your account type
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed">
              Select the option that best describes how you'll use URSPOT.
            </p>

            {/* Account Type Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Option 1: Personal Account */}
              <div
                id="account-type-personal-card"
                onClick={() => setAccountType('personal')}
                className={`group rounded-2xl p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  accountType === 'personal'
                    ? 'border-2 border-slate-900 bg-white shadow-xs ring-1 ring-slate-900/5'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3.5 transition-colors group-hover:bg-slate-200/70">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Personal Account</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Browse marketplace spots, request appointments, and manage reservations.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  Customer
                </span>
              </div>

              {/* Option 2: Business Entity */}
              <div
                id="account-type-business-card"
                onClick={() => setAccountType('business')}
                className={`group rounded-2xl p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  accountType === 'business'
                    ? 'border-2 border-slate-900 bg-white shadow-xs ring-1 ring-slate-900/5'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3.5 transition-colors group-hover:bg-blue-100/70">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Business Merchant</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Salons, spas, wellness venues, and coworking spaces hosting customers.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mt-3 pt-2 border-t border-slate-100">
                  Venue Host
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                id="next-step-btn-1"
                onClick={handleNextStep1}
                className="bg-black text-white px-7 py-2.5 rounded-full font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: CREDENTIALS                                                  */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="animate-in fade-in duration-200">
            {/* Conditional Heading & Subtitle */}
            {accountType === 'personal' ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Set your credentials
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Secure your account with a unique email and password.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Create your credentials
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Secure your account by providing your work email and a strong password.
                </p>
              </>
            )}

            <div className="space-y-4 mb-6">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  {accountType === 'personal' ? 'Email Address' : 'Work Email'}
                </label>
                <div className="relative">
                  {accountType === 'business' && (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                  <input
                    type="email"
                    id="register-email-input"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="name@company.com"
                    className={`w-full ${
                      accountType === 'business' ? 'pl-10 pr-4' : 'px-3.5'
                    } py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  {accountType === 'personal' ? 'Password' : 'Create Password'}
                </label>
                <div className="relative">
                  {accountType === 'business' && (
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password-input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    className={`w-full ${
                      accountType === 'business' ? 'pl-10 pr-10' : 'pl-3.5 pr-10'
                    } py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator Bars */}
                <div className="flex gap-1.5 mt-2.5">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(0)}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(1)}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(2)}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(3)}`} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {accountType === 'personal'
                    ? 'Enter at least 8 characters'
                    : 'Password must be at least 8 characters'}
                </p>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  {accountType === 'business' && (
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirm-password-input"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="••••••••"
                    className={`w-full ${
                      accountType === 'business' ? 'pl-10 pr-10' : 'pl-3.5 pr-10'
                    } py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                      errors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Security Callout Box (Only on Vendor Flow) */}
              {accountType === 'business' && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your password will be encrypted and stored securely. We recommend using a unique
                    password that you don't use on other websites.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              {accountType === 'personal' ? (
                // Personal: Outlined "Previous" button matching Image 1
                <button
                  type="button"
                  id="previous-btn-step-2"
                  onClick={() => setCurrentStep(1)}
                  className="border border-slate-200 text-slate-900 bg-white hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                >
                  Previous
                </button>
              ) : (
                // Vendor: Text with arrow "← Back" matching earlier design
                <button
                  type="button"
                  id="back-btn-step-2"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              {accountType === 'personal' ? (
                // Personal: "Next Step" matching Image 1
                <button
                  type="submit"
                  id="next-step-btn-2"
                  className="bg-black text-white px-7 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                >
                  Next Step
                </button>
              ) : (
                // Vendor: "Continue" matching earlier design
                <button
                  type="submit"
                  id="continue-btn-step-2"
                  className="bg-black text-white px-7 py-2.5 rounded-full font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              )}
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: PERSONAL INFORMATION / ABOUT YOURSELF                        */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="animate-in fade-in duration-200">
            {accountType === 'personal' ? (
              // Personal User (Customer) Matching Image 2
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Tell us about yourself
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  A few more details to personalize your experience.
                </p>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                  {/* First Name & Last Name (2 Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="register-personal-first-name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                        }}
                        placeholder="John"
                        className={`w-full px-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                          errors.firstName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="register-personal-last-name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                        }}
                        placeholder="Doe"
                        className={`w-full px-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                          errors.lastName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                            : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-rose-500 mt-1 font-medium">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Nickname
                    </label>
                    <input
                      type="text"
                      id="register-personal-nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 transition-all"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      id="register-personal-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 transition-all"
                    />
                  </div>

                  {/* reCAPTCHA Widget Box matching Image 2 */}
                  <div className="pt-2">
                    <div
                      id="recaptcha-box-container"
                      onClick={handleCaptchaClick}
                      className={`border rounded-xl p-4 bg-slate-50/60 flex items-center justify-between cursor-pointer select-none transition-all ${
                        errors.captcha
                          ? 'border-rose-300 ring-1 ring-rose-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                            isRobotVerified
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {isVerifyingCaptcha ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                          ) : isRobotVerified ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : null}
                        </div>
                        <span className="text-sm font-medium text-slate-800">I'm not a robot</span>
                      </div>

                      {/* reCAPTCHA Badge branding */}
                      <div className="flex flex-col items-center justify-center text-[9px] text-slate-400 leading-tight">
                        <div className="flex items-center gap-1 mb-0.5">
                          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 3a9 9 0 0 1 8.5 6h-2.2A7 7 0 1 0 12 19a6.9 6.9 0 0 0 4.9-2.1l1.6 1.6A9 9 0 1 1 12 3z"
                              fill="#4285F4"
                            />
                            <circle cx="12" cy="12" r="3" fill="#34A853" />
                          </svg>
                        </div>
                        <span className="font-semibold text-slate-600 tracking-wider">reCAPTCHA</span>
                        <div className="flex gap-1 text-[8px] text-slate-400">
                          <span className="hover:underline">Privacy</span>
                          <span>-</span>
                          <span className="hover:underline">Terms</span>
                        </div>
                      </div>
                    </div>
                    {errors.captcha && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.captcha}</p>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation Buttons (Customer) */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    id="previous-btn-step-3"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="border border-slate-200 text-slate-900 bg-white hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    id="create-account-btn"
                    disabled={isSubmitting}
                    className="bg-black text-white px-7 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Business Entity (Vendor) Matching earlier design
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Personal Information
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Complete your profile to unlock the full potential of URSPOT.
                </p>

                {/* 2x2 Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Legal First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Legal First Name
                    </label>
                    <input
                      type="text"
                      id="register-first-name-input"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                      }}
                      placeholder="Enter first name"
                      className={`w-full px-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                        errors.firstName
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                          : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Legal Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Legal Last Name
                    </label>
                    <input
                      type="text"
                      id="register-last-name-input"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                      }}
                      placeholder="Enter last name"
                      className={`w-full px-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                        errors.lastName
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400/20'
                          : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="register-phone-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 transition-all"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="register-job-title-input"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Operations Manager"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900/15 transition-all"
                    />
                  </div>
                </div>

                {/* Checkboxes Section */}
                <div className="space-y-3 mb-8 pt-1">
                  {/* Checkbox 1: Marketing Preferences */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="marketing-opt-in-checkbox"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-black focus:ring-black mt-1 cursor-pointer accent-slate-900"
                    />
                    <div>
                      <span className="font-medium text-sm text-slate-900 block leading-tight">
                        Marketing Preferences
                      </span>
                      <span className="text-xs text-slate-500 leading-normal block mt-0.5">
                        Keep me updated with professional insights, product updates, and exclusive
                        offers.
                      </span>
                    </div>
                  </label>

                  {/* Checkbox 2: Terms & Privacy Agreement */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="terms-agreement-checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (errors.agreedToTerms) setErrors((prev) => ({ ...prev, agreedToTerms: '' }));
                        }}
                        className="w-4 h-4 rounded-md border-slate-300 text-black focus:ring-black mt-1 cursor-pointer accent-slate-900"
                      />
                      <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                        I agree to the{' '}
                        <span className="underline underline-offset-2 font-medium text-slate-900">
                          Terms of Service
                        </span>{' '}
                        and{' '}
                        <span className="underline underline-offset-2 font-medium text-slate-900">
                          Privacy Policy
                        </span>
                        .
                      </span>
                    </label>
                    {errors.agreedToTerms && (
                      <p className="text-xs text-rose-500 mt-1.5 ml-7 font-medium">
                        {errors.agreedToTerms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions (Vendor) */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    id="back-btn-step-3"
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    id="complete-registration-btn"
                    disabled={isSubmitting}
                    className="bg-black text-white px-7 py-3 rounded-full font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>

      {/* FOOTER BADGES ON STEP 2 (ONLY ON VENDOR FLOW) */}
      {currentStep === 2 && accountType === 'business' && (
        <div className="flex items-center justify-center gap-6 mt-6 text-slate-400 text-xs">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>SOC2 Type II Certified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      )}

      {/* LOGIN LINK CENTERED AT BOTTOM (ON ALL STEPS OR STEP 1, 2, 3) */}
      <div className="text-center mt-6">
        <p className="text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            id="switch-to-login-link-btn"
            onClick={onSwitchToLogin}
            className="font-bold text-slate-900 hover:underline cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};
