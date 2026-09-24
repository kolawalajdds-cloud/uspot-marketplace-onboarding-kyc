import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Lock,
  PenTool,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  Download,
  Building,
  User,
  AlertCircle,
  KeyRound,
  FileCheck2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ESignatureContract, ESignatureData } from '../../../types';
import { contractSigningService } from '../../../services/contractSigningService';
import { SignatureCapture } from '../../common/SignatureCapture';
import { CertificateOfCompletionModal } from '../../common/CertificateOfCompletionModal';
import { AuditTrailModal } from '../../common/AuditTrailModal';
import { ContractDocumentViewerModal } from '../../common/ContractDocumentViewerModal';

interface WorkerSigningModalProps {
  contract: ESignatureContract;
  workerId: string;
  workerName: string;
  workerEmail?: string;
  onClose: () => void;
  onSigningComplete: (updatedContract: ESignatureContract) => void;
}

export const WorkerSigningModal: React.FC<WorkerSigningModalProps> = ({
  contract: initialContract,
  workerId,
  workerName,
  workerEmail,
  onClose,
  onSigningComplete,
}) => {
  const [contract, setContract] = useState<ESignatureContract>(initialContract);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 2 Consent State
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);

  // Step 3 OTP Authentication State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Step 4 Signature Capture State
  const [signatureData, setSignatureData] = useState<ESignatureData | null>(null);

  // Step 5 Signing Execution State
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Modals inside success state
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
  const [showDocViewerModal, setShowDocViewerModal] = useState(false);

  // Countdown timer for mock OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Log contract viewed upon mounting step 1
  useEffect(() => {
    try {
      const updated = contractSigningService.recordContractViewed(contract.id, {
        id: workerId,
        name: workerName,
      });
      setContract(updated);
    } catch (e) {
      console.warn('Could not record contract view', e);
    }
  }, [contract.id, workerId, workerName]);

  // Handle Step 2 Consent Change
  const handleToggleConsent = () => {
    const nextVal = !consentChecked;
    setConsentChecked(nextVal);
    if (nextVal) {
      const ts = contractSigningService.formatCurrentTimestamp();
      setConsentTimestamp(ts);
    } else {
      setConsentTimestamp(null);
    }
  };

  const handleConfirmConsent = () => {
    if (!consentChecked) return;
    try {
      const updated = contractSigningService.recordConsent(contract.id, {
        id: workerId,
        name: workerName,
      });
      setContract(updated);
      setCurrentStep(3);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Step 3 OTP Input
  const handleOtpChange = (index: number, value: string) => {
    setOtpError(null);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = codeOverride || otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await contractSigningService.authenticateSigner(
        contract.id,
        { id: workerId, name: workerName },
        code
      );

      if (res.success && res.contract) {
        setIsAuthenticated(true);
        setContract(res.contract);
        setTimeout(() => {
          setCurrentStep(4);
        }, 500);
      } else {
        setOtpError(res.error || 'Authentication failed. Please verify the code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Authentication error.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFillMockOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    handleVerifyOtp('123456');
  };

  // Step 4: Continue after signature captured
  const handleContinueFromSignature = () => {
    if (!signatureData) return;
    try {
      const updated = contractSigningService.saveSignature(
        contract.id,
        { id: workerId, name: workerName },
        signatureData
      );
      setContract(updated);
      setCurrentStep(5);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Step 5: Final Submission & PDF Generation
  const handleFinalSignContract = async () => {
    setIsSubmittingSignature(true);
    setSubmissionError(null);

    try {
      const finalized = await contractSigningService.confirmAndSignContract(contract.id, {
        id: workerId,
        name: workerName,
        email: workerEmail || contract.workerEmail,
      });
      setContract(finalized);
      onSigningComplete(finalized);
      onClose(); // Explicitly close the modal upon successful submission
    } catch (err: any) {
      setSubmissionError(err.message || 'Error completing contract signing.');
    } finally {
      setIsSubmittingSignature(false);
    }
  };

  // Steps Definition
  const steps = [
    { num: 1, title: 'Review' },
    { num: 2, title: 'Consent' },
    { num: 3, title: 'Authentication' },
    { num: 4, title: 'Signature' },
    { num: 5, title: 'Confirmation' },
    { num: 6, title: 'Signed' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">E-Signature Workflow</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  Step {currentStep} of 6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                {contract.title} &bull; <span className="font-mono text-slate-300">{contract.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6-Step Progress Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between relative">
            {steps.map((s, idx) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-200 scale-105'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 hidden sm:inline ${
                      isCurrent ? 'text-slate-900 font-extrabold' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}

            {/* Connecting Progress Line */}
            <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Wizard Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* ================================================================= */}
          {/* STEP 1: REVIEW CONTRACT                                           */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Callout notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold">Document Requires Electronic Signature</p>
                  <p className="text-amber-800 leading-relaxed font-medium">
                    Please review all terms, service requirements, and compensation details carefully before providing your electronic consent in the next step.
                  </p>
                </div>
              </div>

              {/* Business & Worker Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" /> Host Business
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">{contract.businessName}</p>
                  <p className="text-slate-600">{contract.businessAddress}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {contract.businessEmail} &bull; {contract.businessPhone}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Assigned Specialist
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">{contract.workerName}</p>
                  <p className="text-slate-600">Location: {contract.primaryLocation}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {contract.workerEmail} &bull; {contract.workerPhone}
                  </p>
                </div>
              </div>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-200 bg-white text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contract Type</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.contractType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pay Amount</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.payAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pay Frequency</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.frequency}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effective Period</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">
                    {contract.startDate} - {contract.endDate}
                  </span>
                </div>
              </div>

              {/* Scrollable Terms Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="uppercase tracking-wider text-[11px]">Contract Terms & SLA Agreement</span>
                  <span className="text-slate-400 font-normal">Scroll to read all clauses</span>
                </div>

                <div className="max-h-56 overflow-y-auto p-4 rounded-2xl border border-slate-200 bg-slate-50 font-sans text-xs leading-relaxed text-slate-700 whitespace-pre-line select-text">
                  {contract.slaTerms}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ELECTRONIC SIGNATURE CONSENT                              */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Electronic Signature Legal Consent
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN Act), your voluntary consent is required to execute this contract electronically.
                </p>
              </div>

              {/* Legal Disclosure Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                <p className="font-bold text-slate-900">
                  By continuing, you agree to use an electronic signature for this contract and acknowledge that your electronic signature is intended to have the same effect as your handwritten signature, subject to the applicable agreement and law.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[11px]">
                  <li>You confirm you have reviewed the complete contract terms and scope of work.</li>
                  <li>You consent to receive electronic documents and legal notices via URSPOT.</li>
                  <li>You may download or print a complete PDF copy of the executed contract upon signing.</li>
                  <li>Your signature will be cryptographically bound with a SHA-256 document digest.</li>
                </ul>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                  * Developer / Internal Notice: Production implementation should be reviewed for applicable US federal and state electronic-signature requirements.
                </p>
              </div>

              {/* Explicit Checkbox Consent */}
              <div
                onClick={handleToggleConsent}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                  consentChecked
                    ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    consentChecked
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {consentChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 block">
                    I have read and agree to electronically sign this contract.
                  </span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Signer: {contract.workerName} ({workerEmail || contract.workerEmail})
                  </span>
                  {consentTimestamp && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                      Consent Recorded: {consentTimestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: WORKER AUTHENTICATION (MOCK OTP)                          */}
          {/* ================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Verify your identity before signing
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To protect your account and ensure signature integrity, enter the 6-digit verification code sent to your registered worker email (<strong className="text-slate-700">{workerEmail || contract.workerEmail}</strong>).
                </p>
              </div>

              {/* Prototype Mock Helper Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Prototype Test OTP:</strong> Use mock code <code className="bg-blue-100 font-bold px-1.5 py-0.5 rounded text-blue-800">123456</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillMockOtp}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={isVerifyingOtp || isAuthenticated}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl border-2 transition-all outline-none ${
                      isAuthenticated
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : otpError
                        ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500'
                        : digit
                        ? 'border-slate-900 bg-white text-slate-900 focus:ring-4 focus:ring-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-800 focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {isAuthenticated && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Identity Authenticated! Continuing to signature capture...</span>
                </div>
              )}

              {/* Resend and Verify Action */}
              <div className="flex flex-col items-center justify-center gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isVerifyingOtp || isAuthenticated || otpDigits.join('').length < 6}
                  className="w-full sm:w-64 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Token...</span>
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Authenticate Identity</span>
                  )}
                </button>

                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <span>Didn't receive the code?</span>
                  {resendCountdown > 0 ? (
                    <span>Resend code in {resendCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendCountdown(30)}
                      className="font-bold text-slate-800 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: SIGNATURE CAPTURE                                         */}
          {/* ================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Capture Your Electronic Signature
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose between drawing your signature or uploading a high-resolution photo of your handwritten signature.
                </p>
              </div>

              {/* Reusable SignatureCapture Component */}
              <SignatureCapture
                onSignatureCaptured={(sig) => setSignatureData(sig)}
                signerName={contract.workerName}
              />
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: CONFIRMATION & ATTESTATION                                */}
          {/* ================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Review & Confirm Your Signature
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your captured signature and attestation before final legal execution.
                </p>
              </div>

              {/* Signature Preview Card */}
              <div className="p-6 rounded-2xl border-2 border-slate-900 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Your Signature Attestation
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ready to Execute
                  </span>
                </div>

                {/* Display Signature Image */}
                <div className="h-32 flex items-center justify-center p-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  {signatureData?.processedData || signatureData?.data ? (
                    <img
                      src={signatureData.processedData || signatureData.data}
                      alt="Signature Preview"
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-slate-400">No signature captured</p>
                  )}
                </div>

                {/* Summary Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 text-slate-600">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contract Title</span>
                    <span className="font-bold text-slate-900 truncate block">{contract.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signer Full Name</span>
                    <span className="font-bold text-slate-900 block">{contract.workerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identity Authentication</span>
                    <span className="font-bold text-emerald-700 block">✓ 6-Digit OTP Verified</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Electronic Consent</span>
                    <span className="font-bold text-emerald-700 block">✓ E-SIGN Legal Consent Granted</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signature Capture Method</span>
                    <span className="font-medium text-slate-800 block capitalize">
                      {signatureData?.type === 'draw' ? 'Digital Touch Canvas' : 'Handwritten Photo Upload (Processed)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Execution Timestamp</span>
                    <span className="font-mono text-slate-900 block">{contractSigningService.formatCurrentTimestamp()}</span>
                  </div>
                </div>
              </div>

              {submissionError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submissionError}</span>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 6: SIGNED SUCCESS & CERTIFICATE                             */}
          {/* ================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Execution Complete
                </span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Contract Successfully Signed
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The contract has been executed and cryptographically sealed. Both you and the host business now have access to the signed agreement.
                </p>
              </div>

              {/* 4 Checklist Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Your signature has been recorded</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Your identity was verified</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Your electronic consent was recorded</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">The signed contract PDF has been generated</span>
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 max-w-xl mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> SHA-256 Document Digest
                  </span>
                  <span className="text-slate-400">Status: COMPLETED</span>
                </div>
                <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800 select-all">
                  {contract.documentHash}
                </p>
                <p className="text-[10px] text-slate-400">
                  Signed At: <strong className="text-slate-200">{contract.signedAt}</strong>
                </p>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocViewerModal(true)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>View Contract</span>
                </button>

                <button
                  type="button"
                  onClick={() => contractSigningService.downloadSignedContract(contract)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span>Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuditTrailModal(true)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Audit Trail</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Control Bar */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Continue to Consent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleConfirmConsent}
                disabled={!consentChecked}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue to Authentication</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentStep(4);
                  } else {
                    handleVerifyOtp();
                  }
                }}
                disabled={isVerifyingOtp || (!isAuthenticated && otpDigits.join('').length < 6)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isAuthenticated ? 'Continue to Signature' : 'Verify & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleContinueFromSignature}
                disabled={!signatureData}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={handleFinalSignContract}
                disabled={isSubmittingSignature}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingSignature ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Electronic Signature...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Sign Contract</span>
                  </>
                )}
              </button>
            )}

            {currentStep === 6 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Return to Contracts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Sub-Modals */}
      {showCertificateModal && (
        <CertificateOfCompletionModal
          contract={contract}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {showAuditTrailModal && (
        <AuditTrailModal
          contract={contract}
          onClose={() => setShowAuditTrailModal(false)}
        />
      )}

      {showDocViewerModal && (
        <ContractDocumentViewerModal
          contract={contract}
          onClose={() => setShowDocViewerModal(false)}
        />
      )}
    </div>
  );
};
