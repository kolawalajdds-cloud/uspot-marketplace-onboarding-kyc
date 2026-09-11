import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Building2,
  Lock,
  Info,
  Layers,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  Send,
  Download,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
  PenTool,
  FileCheck,
} from 'lucide-react';
import { Business, TinType, TinVerificationStatus, W9Data } from '../../types';
import { DynamicTinInput, maskTinDisplay, formatTinDisplay } from './DynamicTinInput';
import { PaymentModal } from './PaymentModal';
import { W9TermsModal } from './multistep/W9TermsModal';
import jsPDF from 'jspdf';

interface W9TaxCertificationProps {
  business: Business;
  onSaveDraft: (w9Data: Partial<W9Data>) => void;
  onSubmitW9: (w9Data: W9Data) => Promise<void> | void;
  onNavigateToEkyc?: () => void;
  onPlanSelectSuccess?: (plan: any, amount: number) => Promise<void>;
  onResetW9?: (businessId: string) => void;
}

const FEDERAL_TAX_CLASSIFICATION_OPTIONS = [
  'Individual / Sole Proprietor or single-member LLC',
  'C Corporation',
  'S Corporation',
  'Partnership',
  'Limited Liability Company (LLC)',
  'LLC. Enter the tax classification (C = C corporation, S = S corporation, P = Partnership)',
  'Trust / Estate',
  'Other',
];

const LLC_CLASSIFICATION_OPTIONS = [
  { value: 'C', label: 'C = C Corporation (default)' },
  { value: 'S', label: 'S = S Corporation' },
  { value: 'P', label: 'P = Partnership' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const W9TaxCertification: React.FC<W9TaxCertificationProps> = ({
  business,
  onSaveDraft,
  onSubmitW9,
  onNavigateToEkyc,
  onPlanSelectSuccess,
  onResetW9,
}) => {
  const isKycApproved =
    business.status === 'KYC Approved' ||
    business.status === 'Live' ||
    business.subTab === 'approved';

  const isPlanSelected = Boolean(
    business.payment?.planSelected || business.subscription
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Pre-fill / reference values from verified eKYC
  const ekycLegalName =
    business.coreDetails?.legalEntityName ||
    business.verification?.beneficialOwner?.fullName ||
    business.coreDetails?.businessName ||
    'Business Entity LLC';

  const ekycEntityType =
    business.verification?.legalEntityType || 'Limited Liability Company (LLC)';

  const ekycRawTin = (
    business.verification?.tinRaw ||
    business.verification?.einVerification?.einEntered ||
    ''
  ).replace(/\D/g, '');

  const ekycTinType: TinType =
    business.verification?.tinType ||
    (ekycEntityType === 'Sole Proprietorship' ? 'SSN' : 'EIN');

  // Status & Submit Handling
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    Boolean(business.w9?.status === 'submitted' || business.w9?.status === 'verified')
  );

  // Form State - NO prefilled fake defaults so test cases run completely clean!
  const [legalName, setLegalName] = useState<string>(business.w9?.legalName || '');
  const [businessName, setBusinessName] = useState<string>(business.w9?.businessNameOrDisregarded || '');
  const [taxClassification, setTaxClassification] = useState<string>(
    business.w9?.federalTaxClassification || ''
  );
  const [llcTaxClassification, setLlcTaxClassification] = useState<string>(
    business.w9?.llcTaxClassification || 'C'
  );
  const [otherClassificationDetail, setOtherClassificationDetail] = useState<string>(
    business.w9?.otherClassificationDetail || ''
  );
  const [exemptPayeeCode, setExemptPayeeCode] = useState<string>(
    business.w9?.exemptPayeeCode || ''
  );
  const [fatcaCode, setFatcaCode] = useState<string>(business.w9?.fatcaCode || '');
  const [accountNumber, setAccountNumber] = useState<string>(
    business.w9?.accountNumbers || ''
  );

  const [streetAddress, setStreetAddress] = useState<string>(business.w9?.streetAddress || '');
  const [city, setCity] = useState<string>(business.w9?.city || '');
  const [stateCode, setStateCode] = useState<string>(business.w9?.state || '');
  const [zipCode, setZipCode] = useState<string>(business.w9?.zipCode || '');

  // TIN state & verification status
  const [tinType, setTinType] = useState<TinType>(business.w9?.tinType || 'EIN');
  const [currentTinInput, setCurrentTinInput] = useState<string>(business.w9?.tinRaw || '');
  const [tinVerificationStatus, setTinVerificationStatus] = useState<TinVerificationStatus>(
    business.w9?.tinMatchStatus || (business.w9?.status === 'verified' ? 'match' : 'idle')
  );
  const [isVerifyingChangedTin, setIsVerifyingChangedTin] = useState(false);
  const [isEditingTin, setIsEditingTin] = useState(false);

  // Certifications Checkboxes - start clean unchecked!
  const [certCorrectTin, setCertCorrectTin] = useState<boolean>(
    business.w9?.certifications?.correctTin ?? false
  );
  const [certNoBackupWithholding, setCertNoBackupWithholding] = useState<boolean>(
    business.w9?.certifications?.noBackupWithholding ?? false
  );
  const [certUsPerson, setCertUsPerson] = useState<boolean>(
    business.w9?.certifications?.usPerson ?? false
  );
  const [certFatcaCorrect, setCertFatcaCorrect] = useState<boolean>(
    business.w9?.certifications?.fatcaCorrect ?? false
  );

  // Electronic Signature & Canvas State
  const [signatureName, setSignatureName] = useState<string>(business.w9?.signatureName || '');
  const [agreedPerjury, setAgreedPerjury] = useState<boolean>(business.w9?.agreedPerjury ?? false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string>(business.w9?.signatureImage || '');
  const [hasSignature, setHasSignature] = useState<boolean>(Boolean(business.w9?.signatureImage));
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedSigRef = useRef<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronize state whenever business changes or W-9 is reset
  useEffect(() => {
    const isCert = Boolean(business.w9?.status === 'submitted' || business.w9?.status === 'verified');
    setIsSubmitted(isCert);

    if (business.w9) {
      setLegalName(business.w9.legalName || '');
      setBusinessName(business.w9.businessNameOrDisregarded || '');
      setTaxClassification(business.w9.federalTaxClassification || '');
      setLlcTaxClassification(business.w9.llcTaxClassification || 'C');
      setOtherClassificationDetail(business.w9.otherClassificationDetail || '');
      setExemptPayeeCode(business.w9.exemptPayeeCode || '');
      setFatcaCode(business.w9.fatcaCode || '');
      setAccountNumber(business.w9.accountNumbers || '');
      setStreetAddress(business.w9.streetAddress || '');
      setCity(business.w9.city || '');
      setStateCode(business.w9.state || '');
      setZipCode(business.w9.zipCode || '');
      setTinType(business.w9.tinType || 'EIN');
      setCurrentTinInput(business.w9.tinRaw || '');
      setTinVerificationStatus(business.w9.tinMatchStatus || (isCert ? 'match' : 'idle'));
      setCertCorrectTin(business.w9.certifications?.correctTin ?? false);
      setCertNoBackupWithholding(business.w9.certifications?.noBackupWithholding ?? false);
      setCertUsPerson(business.w9.certifications?.usPerson ?? false);
      setCertFatcaCorrect(business.w9.certifications?.fatcaCorrect ?? false);
      setSignatureName(business.w9.signatureName || '');
      setAgreedPerjury(business.w9.agreedPerjury ?? false);
      setSignatureImage(business.w9.signatureImage || '');
      setHasSignature(Boolean(business.w9.signatureImage));
    } else {
      // Clean blank state for test cases
      setLegalName('');
      setBusinessName('');
      setTaxClassification('');
      setLlcTaxClassification('C');
      setOtherClassificationDetail('');
      setExemptPayeeCode('');
      setFatcaCode('');
      setAccountNumber('');
      setStreetAddress('');
      setCity('');
      setStateCode('');
      setZipCode('');
      setTinType('EIN');
      setCurrentTinInput('');
      setTinVerificationStatus('idle');
      setCertCorrectTin(false);
      setCertNoBackupWithholding(false);
      setCertUsPerson(false);
      setCertFatcaCorrect(false);
      setSignatureName('');
      setAgreedPerjury(false);
      setSignatureImage('');
      setHasSignature(false);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      loadedSigRef.current = null;
    }
    setValidationErrors([]);
  }, [business.id, business.w9]);

  // Test Helpers: Fast population & reset
  const handleFillSampleData = () => {
    const bizLegal = business.coreDetails?.legalEntityName || 'Nexus Operations LLC';
    const bizTrade = business.coreDetails?.businessName || 'The Nexus Workspace & Lab';
    const bizStreet = business.coreDetails?.streetAddress || '420 Montgomery Street, Suite 800';
    const bizCity = business.coreDetails?.city || 'San Francisco';
    const bizState = business.coreDetails?.state || 'CA';
    const bizZip = business.coreDetails?.zipCode || '94104';
    const sampleTin = '842918392';
    const signer = business.verification?.beneficialOwner?.fullName || 'Alex Vance';

    setLegalName(bizLegal);
    setBusinessName(bizTrade);
    setTaxClassification('Limited Liability Company (LLC)');
    setLlcTaxClassification('C');
    setStreetAddress(bizStreet);
    setCity(bizCity);
    setStateCode(bizState);
    setZipCode(bizZip);
    setTinType('EIN');
    setCurrentTinInput(sampleTin);
    setTinVerificationStatus('match');
    setCertCorrectTin(true);
    setCertNoBackupWithholding(true);
    setCertUsPerson(true);
    setCertFatcaCorrect(true);
    setSignatureName(signer);
    setAgreedPerjury(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(30, 70);
        ctx.bezierCurveTo(70, 20, 110, 100, 160, 45);
        ctx.bezierCurveTo(190, 20, 220, 80, 260, 50);
        ctx.stroke();
        const dataUrl = canvas.toDataURL('image/png');
        setSignatureImage(dataUrl);
        setHasSignature(true);
      }
    } else {
      setHasSignature(true);
      setSignatureImage('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="24" fill="%230f172a">Alex Vance</text></svg>');
    }

    setValidationErrors([]);
    showToast('✓ Sample W-9 data populated for rapid test submission.');
  };

  const handleClearAllFields = () => {
    setLegalName('');
    setBusinessName('');
    setTaxClassification('');
    setLlcTaxClassification('C');
    setOtherClassificationDetail('');
    setExemptPayeeCode('');
    setFatcaCode('');
    setAccountNumber('');
    setStreetAddress('');
    setCity('');
    setStateCode('');
    setZipCode('');
    setTinType('EIN');
    setCurrentTinInput('');
    setTinVerificationStatus('idle');
    setCertCorrectTin(false);
    setCertNoBackupWithholding(false);
    setCertUsPerson(false);
    setCertFatcaCorrect(false);
    setSignatureName('');
    setAgreedPerjury(false);
    setSignatureImage('');
    setHasSignature(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    loadedSigRef.current = null;
    setValidationErrors([]);
    showToast('All form fields cleared.');
  };

  const handleResetToUncertified = () => {
    if (onResetW9) {
      onResetW9(business.id);
    }
    handleClearAllFields();
    setIsSubmitted(false);
    showToast(`✓ Form W-9 revoked for "${business.coreDetails.businessName}". 24% backup withholding is now active.`);
  };

  // Load existing signature on canvas when available and not submitted
  useEffect(() => {
    if (isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (signatureImage && loadedSigRef.current !== signatureImage) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
        loadedSigRef.current = signatureImage;
      };
      img.src = signatureImage;
    }
  }, [signatureImage, isSubmitted]);

  // Drawing event handlers
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setIsDrawing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureImage(dataUrl);
    }
  };

  const handleClearSignature = () => {
    if (isSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureImage('');
    loadedSigRef.current = null;
  };

  // Check if current TIN is same as verified eKYC TIN (Rule 17)
  const isSameAsEkycTin =
    Boolean(ekycRawTin) &&
    currentTinInput.replace(/\D/g, '') === ekycRawTin &&
    tinType === ekycTinType;

  // Masked TIN for safe display (Never expose raw full TIN)
  const maskedTinDisplay = maskTinDisplay(currentTinInput, tinType);

  const handleVerifyChangedTin = () => {
    const raw = currentTinInput.replace(/\D/g, '');
    if (raw.length < 9) return;
    setIsVerifyingChangedTin(true);
    setTinVerificationStatus('verifying');

    setTimeout(() => {
      setIsVerifyingChangedTin(false);
      const outcome =
        raw === '000000000'
          ? 'error'
          : raw === '999999999'
          ? 'mismatch'
          : 'match';
      setTinVerificationStatus(outcome);
      if (outcome === 'match') {
        setIsEditingTin(false);
        showToast('✓ New TIN successfully matched and verified with IRS.');
      }
    }, 1000);
  };

  // Validations before submit
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!legalName.trim()) errors.push('Name (as shown on income tax return) is required.');
    if (!taxClassification) errors.push('Federal Tax Classification is required.');
    if (!streetAddress.trim()) errors.push('Street Address is required.');
    if (!city.trim()) errors.push('City is required.');
    if (!stateCode.trim()) errors.push('State is required.');
    if (!zipCode.trim() || zipCode.replace(/\D/g, '').length < 5) errors.push('Valid 5-digit Zip Code is required.');
    
    const cleanTin = currentTinInput.replace(/\D/g, '');
    if (cleanTin.length !== 9) errors.push('A valid 9-digit TIN (EIN or SSN) is required.');
    if (tinVerificationStatus !== 'match') {
      errors.push('Your TIN must be verified with the IRS before completing the W-9.');
    }

    if (!certCorrectTin || !certNoBackupWithholding || !certUsPerson || !certFatcaCorrect) {
      errors.push('All 4 IRS certification statements must be confirmed.');
    }

    if (!signatureName.trim()) {
      errors.push('Full Legal Name for electronic signature is required.');
    }
    if (!agreedPerjury) {
      errors.push('You must agree to electronically sign under penalties of perjury.');
    }
    if (!signatureImage && !hasSignature) {
      errors.push('Please draw your electronic signature on the canvas (Card 7).');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    let currentSig = signatureImage;
    if (!currentSig && canvasRef.current && hasSignature) {
      try {
        currentSig = canvasRef.current.toDataURL('image/png');
      } catch {
        // ignore
      }
    }
    const draftPayload: Partial<W9Data> = {
      businessId: business.id,
      legalName,
      businessNameOrDisregarded: businessName,
      federalTaxClassification: taxClassification,
      llcTaxClassification,
      otherClassificationDetail,
      exemptPayeeCode,
      fatcaCode,
      accountNumbers: accountNumber,
      streetAddress,
      city,
      state: stateCode,
      zipCode,
      tinType,
      tinRaw: currentTinInput.replace(/\D/g, ''),
      tinMasked: maskedTinDisplay,
      tinVerified: tinVerificationStatus === 'match',
      tinMatchStatus: tinVerificationStatus,
      reusedEkycTin: isSameAsEkycTin,
      certifications: {
        correctTin: certCorrectTin,
        noBackupWithholding: certNoBackupWithholding,
        usPerson: certUsPerson,
        fatcaCorrect: certFatcaCorrect,
      },
      signatureName,
      signatureImage: currentSig,
      agreedPerjury,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };

    onSaveDraft(draftPayload);
    showToast('W-9 Tax Certification draft saved successfully.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let finalSig = signatureImage;
    if (!finalSig && canvasRef.current) {
      try {
        finalSig = canvasRef.current.toDataURL('image/png');
      } catch {
        // ignore
      }
    }

    // Capture backend audit information automatically (Rule 20)
    const now = new Date().toISOString();
    const fullPayload: W9Data = {
      businessId: business.id,
      legalName,
      businessNameOrDisregarded: businessName,
      federalTaxClassification: taxClassification,
      llcTaxClassification,
      otherClassificationDetail,
      exemptPayeeCode,
      fatcaCode,
      accountNumbers: accountNumber,
      streetAddress,
      city,
      state: stateCode,
      zipCode,
      tinType,
      tinRaw: currentTinInput.replace(/\D/g, ''),
      tinMasked: maskedTinDisplay,
      tinVerified: true,
      tinMatchStatus: 'match',
      reusedEkycTin: isSameAsEkycTin,
      certifications: {
        correctTin: certCorrectTin,
        noBackupWithholding: certNoBackupWithholding,
        usPerson: certUsPerson,
        fatcaCorrect: certFatcaCorrect,
      },
      signatureName,
      signatureImage: finalSig,
      agreedPerjury: true,
      status: 'verified',
      signedAt: now,
      signerIp: '198.51.100.42', // Captured by backend in production
      signerUserAgent: navigator.userAgent || 'UrSpot Secure Client / Chrome 124',
      pdfGeneratedUrl: `/downloads/W9_${legalName.replace(/\s+/g, '_')}_signed.pdf`,
      updatedAt: now,
    };

    await onSubmitW9(fullPayload);
    setSignatureImage(finalSig);
    setIsSubmitted(true);
    showToast('✓ W-9 Form successfully certified and submitted!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter', // 612 x 792 pt
      });

      const pageWidth = 612;
      const margin = 36; // 0.5 inch margins
      const contentWidth = pageWidth - margin * 2; // 540 pt
      let currentY = 36;

      // Header Top Border Box
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.5);
      doc.line(margin, currentY, margin + contentWidth, currentY);

      // Header Columns
      currentY += 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Form', margin, currentY);
      doc.setFontSize(24);
      doc.text('W-9', margin, currentY + 22);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('(Rev. March 2024)', margin, currentY + 31);
      doc.text('Department of the Treasury', margin, currentY + 38);
      doc.text('Internal Revenue Service', margin, currentY + 45);

      // Center title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Request for Taxpayer', margin + 85, currentY + 8);
      doc.text('Identification Number and Certification', margin + 85, currentY + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Go to www.irs.gov/FormW9 for instructions and the latest information.', margin + 85, currentY + 34);

      // Right box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Give Form to the', margin + 390, currentY + 12);
      doc.text('requester. Do not', margin + 390, currentY + 22);
      doc.text('send to the IRS.', margin + 390, currentY + 32);

      currentY += 52;
      doc.setLineWidth(1.5);
      doc.line(margin, currentY, margin + contentWidth, currentY);

      // Helper function to draw a field row
      const drawFieldRow = (label: string, value: string, height: number) => {
        doc.setLineWidth(0.5);
        doc.setDrawColor(180, 180, 180);
        doc.rect(margin, currentY, contentWidth, height);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(label, margin + 5, currentY + 9);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(value || '—', margin + 5, currentY + 22);

        currentY += height;
      };

      // Line 1: Name
      drawFieldRow('1 Name of entity/individual (as shown on your income tax return). Name is required on this line; do not leave blank.', legalName, 28);

      // Line 2: Business name / disregarded entity name
      drawFieldRow('2 Business name/disregarded entity name, if different from above', businessName || 'None', 28);

      // Line 3: Federal Tax Classification
      let taxClassText = taxClassification;
      if (taxClassification.includes('LLC') && llcTaxClassification) {
        taxClassText += ` (LLC Tax Treatment: ${llcTaxClassification})`;
      }
      if (otherClassificationDetail) {
        taxClassText += ` - ${otherClassificationDetail}`;
      }
      drawFieldRow('3a Check appropriate box for federal tax classification of the person whose name is entered on line 1', `[ X ]  ${taxClassText}`, 28);

      // Line 4: Exemptions
      const exemptionStr = `Exempt Payee Code: ${exemptPayeeCode || 'None'}    |    Exemption from FATCA reporting code: ${fatcaCode || 'None'}`;
      drawFieldRow('4 Exemptions (codes apply only to certain entities, not individuals; see instructions)', exemptionStr, 26);

      // Line 5: Street Address
      drawFieldRow('5 Address (number, street, and apt. or suite no.). See instructions.', streetAddress, 26);

      // Line 6: City, State, ZIP
      drawFieldRow('6 City, state, and ZIP code', `${city}, ${stateCode} ${zipCode}`, 26);

      // Line 7: Account Numbers & Requester
      const line7Str = `Account number(s): ${accountNumber || 'None'}    |    Requester: UrSpot Marketplace Platform Services (Compliance)`;
      drawFieldRow('7 List account number(s) here (optional) & Requester Info', line7Str, 26);

      currentY += 6;

      // PART I: TAXPAYER IDENTIFICATION NUMBER (TIN)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(margin, currentY, contentWidth, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('Part I   Taxpayer Identification Number (TIN)', margin + 6, currentY + 11);
      currentY += 16;

      // TIN Box
      doc.setLineWidth(0.5);
      doc.setDrawColor(180, 180, 180);
      doc.rect(margin, currentY, contentWidth, 38);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(70, 70, 70);
      doc.text('Enter your TIN in the appropriate box. For individuals, this is your SSN. For other entities, it is your EIN.', margin + 6, currentY + 11);
      doc.text('The TIN provided matches IRS records and business registration.', margin + 6, currentY + 21);

      // Right box inside TIN showing Masked TIN
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(1);
      doc.rect(margin + 340, currentY + 6, 190, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(tinType === 'EIN' ? 'Employer ID Number (EIN)' : 'Social Security Number (SSN)', margin + 346, currentY + 15);
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(maskedTinDisplay, margin + 346, currentY + 27);

      currentY += 44;

      // PART II: CERTIFICATION
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, currentY, contentWidth, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('Part II  Certification', margin + 6, currentY + 11);
      currentY += 16;

      doc.setLineWidth(0.5);
      doc.setDrawColor(180, 180, 180);
      doc.rect(margin, currentY, contentWidth, 108);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Under penalties of perjury, I certify that:', margin + 6, currentY + 11);

      const certs = [
        '1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and',
        '2. I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the IRS that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and',
        '3. I am a U.S. citizen or other U.S. person (defined in IRS Form W-9 instructions); and',
        '4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.',
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(50, 50, 50);

      let certY = currentY + 22;
      certs.forEach((item) => {
        const splitLines = doc.splitTextToSize(item, contentWidth - 14);
        doc.text(splitLines, margin + 6, certY);
        certY += splitLines.length * 8.5;
      });

      // Certification instructions note
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('Certification instructions: You must cross out item 2 above if you have been notified by the IRS that you are subject to backup withholding.', margin + 6, certY + 3);

      currentY += 114;

      // SIGNATURE SECTION
      doc.setLineWidth(1);
      doc.setDrawColor(15, 23, 42);
      doc.rect(margin, currentY, contentWidth, 80);

      // Left column: Sign Here
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, 65, 80, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Sign', margin + 18, currentY + 36);
      doc.text('Here', margin + 18, currentY + 49);

      // Right area: Signature Image & Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Signature of', margin + 74, currentY + 14);
      doc.text('U.S. person  ›', margin + 74, currentY + 23);

      // Date on far right
      const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      doc.text('Date  ›  ' + (business.w9?.signedAt ? new Date(business.w9.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : formattedDate), margin + 380, currentY + 23);

      // Render actual electronic signature image onto the PDF if available
      let sigDrawn = false;
      const effectiveSig = signatureImage || (canvasRef.current && hasSignature ? canvasRef.current.toDataURL('image/png') : '');
      if (effectiveSig) {
        try {
          doc.addImage(effectiveSig, 'PNG', margin + 130, currentY + 6, 210, 50);
          sigDrawn = true;
        } catch {
          sigDrawn = false;
        }
      }

      if (!sigDrawn) {
        doc.setFont('courier', 'bolditalic');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(signatureName || 'Digital Electronic Signature', margin + 130, currentY + 38);
      }

      // Bottom baseline inside signature box
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 130, currentY + 58, margin + 530, currentY + 58);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(`Electronically certified under penalties of perjury by: ${signatureName || 'Authorized Signer'}`, margin + 130, currentY + 70);

      currentY += 88;

      // Compliance & Audit Trail Footer Box
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, currentY, contentWidth, 38, 'F');
      doc.setLineWidth(0.5);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, currentY, contentWidth, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text('OFFICIAL URPOT COMPLIANCE AUDIT TRAIL • IRS SUBSTITUTE FORM W-9', margin + 8, currentY + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      const auditLine1 = `Document Status: ${isSubmitted ? 'VERIFIED & CERTIFIED WITH IRS' : 'IN-PROGRESS / DRAFT'}    |    Signer IP: 198.51.100.42    |    Hash ID: W9-${business.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const auditLine2 = `Security Verification: 256-bit Encrypted compliance record stored in UrSpot Vault. Substitute form pursuant to Treasury Reg. § 31.3406(h)-3(c).`;
      doc.text(auditLine1, margin + 8, currentY + 21);
      doc.text(auditLine2, margin + 8, currentY + 30);

      // Save PDF file
      const safeFileName = `W9_${legalName.replace(/[^a-zA-Z0-9]/g, '_')}_signed.pdf`;
      doc.save(safeFileName);
      showToast(`✓ Form W-9 exported successfully as "${safeFileName}".`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Error generating Form W-9 PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150" id="w9-certification-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TEST CONTROLS & STATUS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">W-9 Test Controls:</span>
          {isSubmitted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified with IRS (0% Tax Withholding)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Uncertified / Missing W-9 (24% IRS Withholding Active)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isSubmitted && (
            <>
              <button
                type="button"
                id="btn-fill-sample-w9"
                onClick={handleFillSampleData}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                title="Populates valid test data for fast submission testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Fill Sample W-9</span>
              </button>
              <button
                type="button"
                id="btn-clear-w9-form"
                onClick={handleClearAllFields}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clears all fields to completely empty"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear All Fields</span>
              </button>
            </>
          )}

          {isSubmitted && onResetW9 && (
            <button
              type="button"
              id="btn-reset-w9-uncertified"
              onClick={handleResetToUncertified}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="Revokes W-9 so you can test customer payment with 24% IRS backup withholding"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset to Uncertified (Test 24% Withholding)</span>
            </button>
          )}
        </div>
      </div>

      {/* Header: Title, Subtitle, and Top-Right 3-Step Progress Stepper matching Image 1 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              W-9 Tax Certification
            </h1>
            <button
              type="button"
              id="btn-header-export-w9-pdf"
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95"
              title="Export Form W-9 in PDF format"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export PDF</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Complete and certify your tax information to receive payouts.
          </p>
        </div>

        {/* 3-Step Progress Indicator matching Image 1 */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-2 sm:px-3 sm:py-2 shadow-2xs self-start lg:self-auto flex-wrap">
          {/* Step 1: eKYC Approved */}
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isKycApproved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isKycApproved ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {isKycApproved ? 'eKYC Approved' : 'eKYC In Review'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isKycApproved ? 'Business verified' : 'Admin review'}
              </span>
            </div>
          </div>

          <span className="text-slate-300 text-xs px-1">›</span>

          {/* Step 2: Plan Selected */}
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isPlanSelected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isPlanSelected ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {isPlanSelected ? 'Plan Selected' : 'Select Plan'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isPlanSelected
                  ? `${business.payment?.planSelected || business.subscription || 'Pro'} Plan (Active)`
                  : 'Subscription'}
              </span>
            </div>
          </div>

          <span className="text-slate-300 text-xs px-1">›</span>

          {/* Step 3: W-9 Form */}
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isSubmitted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isSubmitted ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-blue-700 leading-tight">
                W-9 Form
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isSubmitted ? 'Certified & Verified' : 'Complete & Sign'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEQUENTIAL FLOW GATING: If KYC is NOT yet approved */}
      {!isKycApproved && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-amber-950">
                KYC Verification Under Review by UrSpot Admin
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Your business eKYC dossier is currently pending final approval from the UrSpot compliance admin. Per platform compliance rules, the W-9 tax certification unlocks immediately after KYC approval and subscription plan activation.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            {onNavigateToEkyc && (
              <button
                type="button"
                onClick={onNavigateToEkyc}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span>View / Edit eKYC Submission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[11px] text-amber-800">
              Middesk TIN verification confirmed. Awaiting Super Admin review.
            </span>
          </div>
        </div>
      )}

      {/* SEQUENTIAL FLOW GATING: If KYC is approved but Plan is NOT yet selected */}
      {isKycApproved && !isPlanSelected && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  ✓ eKYC Approved
                </span>
                <h3 className="text-base font-extrabold text-blue-950">
                  Step 2 Required: Select Your Platform Subscription Plan
                </h3>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Congratulations! Your eKYC compliance has been approved by the Super Admin. Please choose your marketplace plan to activate your listing and unlock the final W-9 tax certification.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="button"
              id="btn-select-plan-w9-gate"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Select Platform Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal for Plan Selection */}
      <PaymentModal
        businessId={business.id}
        businessName={business.coreDetails?.businessName || 'Business'}
        initialPlan="Pro"
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={async (plan, amount) => {
          if (onPlanSelectSuccess) {
            await onPlanSelectSuccess(plan, amount);
          }
          setIsPaymentModalOpen(false);
          showToast(`Plan ${plan} activated! W-9 Tax Certification is now unlocked.`);
        }}
      />

      {/* SUCCESS STATE: If W-9 is already submitted / verified */}
      {isSubmitted && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-emerald-950">
                    ✓ W-9 Successfully Submitted & Verified
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Status: Verified
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your electronic W-9 tax certification has been validated against IRS records and securely stored in the UrSpot compliance vault. Your business is ready for marketplace payouts and Form 1099 reporting.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-download-w9-pdf"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5 self-start"
            >
              <Download className="w-4 h-4" />
              <span>Download W-9 PDF</span>
            </button>
          </div>

          {/* Submission Audit Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Legal Name</span>
              <strong className="text-slate-900 font-bold truncate block">{legalName}</strong>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Masked TIN</span>
              <strong className="text-slate-900 font-mono font-bold block">{maskedTinDisplay}</strong>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tax Classification</span>
              <strong className="text-slate-900 font-bold truncate block">{taxClassification}</strong>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Signed Date</span>
              <strong className="text-emerald-700 font-bold block">
                {business.w9?.signedAt
                  ? new Date(business.w9.signedAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Box if attempted submit with missing fields */}
      {validationErrors.length > 0 && (
        <div className="p-4.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-950">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please correct the following before signing & submitting:</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Green Information Banner matching Image 1 */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Business information pre-filled from your verified eKYC. Please review, confirm and sign to complete.</span>
      </div>

      {/* Form Cards Stack matching Image 1 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 0: Business Verification Summary (from eKYC) matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Business Verification Summary (from eKYC)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Legal Name</span>
              <strong className="text-slate-900 font-bold block truncate">{ekycLegalName}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Entity Type</span>
              <strong className="text-slate-900 font-bold block truncate">
                {ekycEntityType.includes('LLC') ? 'LLC' : ekycEntityType}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {ekycTinType} (Verified)
              </span>
              <strong className="text-slate-900 font-mono font-bold block">
                {maskTinDisplay(ekycRawTin, ekycTinType)}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Verification Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Matched with IRS</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">KYC Status</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isKycApproved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isKycApproved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Approved</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Under Review</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Card 1: 1. General Information matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">General Information</h2>
              <p className="text-xs text-slate-400 font-normal">
                Provide your legal name as shown on your income tax return.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name (as shown on your income tax return) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 pr-16 font-medium"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-slate-400 pointer-events-none">
                  <Lock className="w-3.5 h-3.5" title="Pre-filled from verified eKYC" />
                  <Info className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Name / Disregarded Entity Name <span className="text-slate-400 text-[11px] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Company LLC or DBA"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Card 2: 2. Tax Classification matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Tax Classification</h2>
              <p className="text-xs text-slate-400 font-normal">
                Select the appropriate tax classification for your business.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Federal Tax Classification <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={taxClassification}
                  onChange={(e) => setTaxClassification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {FEDERAL_TAX_CLASSIFICATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LLC Tax Classification (if applicable) matching Image 1 */}
            {taxClassification.includes('LLC') && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  LLC Tax Classification (if applicable) <span className="text-red-500">*</span>
                </label>
                <select
                  value={llcTaxClassification}
                  onChange={(e) => setLlcTaxClassification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {LLC_CLASSIFICATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {taxClassification === 'Other' && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specify Other Tax Classification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otherClassificationDetail}
                  onChange={(e) => setOtherClassificationDetail(e.target.value)}
                  placeholder="Specify classification"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card 3: 3. Exemptions & Accounts matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              3
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Exemptions & Accounts <span className="text-slate-400 text-xs font-normal">(Optional)</span></h2>
              <p className="text-xs text-slate-400 font-normal">
                Provide exemption codes if applicable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Exempt Payee Code
              </label>
              <input
                type="text"
                placeholder="Code (if any)"
                value={exemptPayeeCode}
                onChange={(e) => setExemptPayeeCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                FATCA Exemption Code
              </label>
              <input
                type="text"
                placeholder="Code (if any)"
                value={fatcaCode}
                onChange={(e) => setFatcaCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Number(s)
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Card 4: 4. Address matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              4
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Address</h2>
              <p className="text-xs text-slate-400 font-normal">
                Provide your current business address.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                {US_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 5: 5. Taxpayer Identification Number (TIN) matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              5
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Taxpayer Identification Number (TIN)</h2>
              <p className="text-xs text-slate-400 font-normal">
                Your TIN is used for tax reporting. Information is encrypted for your security.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* TIN Type Radios matching Image 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                TIN Type <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="w9-tin-type-choice"
                    checked={tinType === 'EIN'}
                    onChange={() => {
                      setTinType('EIN');
                      if (tinType !== 'EIN') {
                        setIsEditingTin(true);
                        setTinVerificationStatus('not_verified');
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span>EIN (Business / Entity)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="w9-tin-type-choice"
                    checked={tinType === 'SSN'}
                    onChange={() => {
                      setTinType('SSN');
                      if (tinType !== 'SSN') {
                        setIsEditingTin(true);
                        setTinVerificationStatus('not_verified');
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <span>SSN (Individual / Sole Proprietor)</span>
                </label>
              </div>
            </div>

            {/* If TIN is same as verified eKYC TIN: locked, masked display matching Image 1 */}
            {isSameAsEkycTin && !isEditingTin ? (
              <div className="max-w-md space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {tinType === 'EIN' ? 'Employer Identification Number (EIN)' : 'Social Security Number (SSN)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={maskedTinDisplay}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 pr-10 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <span>Verified with IRS via Middesk</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTin(true);
                      setTinVerificationStatus('not_verified');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Change TIN
                  </button>
                </div>
              </div>
            ) : (
              /* If User Changes TIN: warn and require re-verification (Rule 16 & 17) */
              <div className="max-w-xl space-y-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Changing your TIN requires a new IRS verification.</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  The updated {tinType} will be verified against IRS database records via our backend service before the W-9 can be certified.
                </p>

                <DynamicTinInput
                  tinType={tinType}
                  value={currentTinInput}
                  onChange={(raw) => {
                    setCurrentTinInput(raw);
                    setTinVerificationStatus('not_verified');
                  }}
                  onVerify={handleVerifyChangedTin}
                  status={tinVerificationStatus}
                  onStatusChange={(status) => setTinVerificationStatus(status)}
                  businessName={legalName}
                  showTestingControls={true}
                />

                {isSameAsEkycTin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTin(false);
                      setTinVerificationStatus('match');
                    }}
                    className="text-[11px] text-blue-700 font-bold underline cursor-pointer block pt-1"
                  >
                    Cancel and reuse existing eKYC verification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 6: 6. Certification matching Image 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              6
            </span>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Certification</h2>
              <p className="text-xs text-slate-400 font-normal">
                Please read and confirm the following statements (required by IRS).
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
              Under penalties of perjury, I certify that:
            </p>

            <div className="space-y-3.5 pl-1">
              {/* 1. Correct TIN */}
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  id="w9-cert-correct-tin"
                  checked={certCorrectTin}
                  onChange={(e) => setCertCorrectTin(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer w-4 h-4 shrink-0"
                />
                <span>
                  <strong>1.</strong> The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
                </span>
              </label>

              {/* 2. Backup Withholding */}
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  id="w9-cert-backup-withholding"
                  checked={certNoBackupWithholding}
                  onChange={(e) => setCertNoBackupWithholding(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer w-4 h-4 shrink-0"
                />
                <span>
                  <strong>2.</strong> I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and
                </span>
              </label>

              {/* 3. U.S. Person */}
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  id="w9-cert-us-person"
                  checked={certUsPerson}
                  onChange={(e) => setCertUsPerson(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer w-4 h-4 shrink-0"
                />
                <span>
                  <strong>3.</strong> I am a U.S. citizen or other U.S. person (defined below); and
                </span>
              </label>

              {/* 4. FATCA */}
              <label className="flex items-start gap-3 text-xs text-slate-800 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  id="w9-cert-fatca"
                  checked={certFatcaCorrect}
                  onChange={(e) => setCertFatcaCorrect(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer w-4 h-4 shrink-0"
                />
                <span>
                  <strong>4.</strong> The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.
                </span>
              </label>
            </div>

            {/* Certification Instructions */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
              <span className="font-bold text-slate-900 block">Certification instructions.</span>
              <p className="text-slate-600">
                You must cross out item 2 above if you have been notified by the IRS that you are currently subject to backup withholding because you have failed to report all interest and dividends on your tax return. For real estate transactions, item 2 does not apply. For mortgage interest paid, acquisition or abandonment of secured property, cancellation of debt, contributions to an individual retirement arrangement (IRA), and, generally, payments other than interest and dividends, you are not required to sign the certification, but you must provide your correct TIN. See the instructions for Part II, later.
              </p>
            </div>
          </div>
        </div>

        {/* Card 7: 7. Electronic Signature & Compliance Certification */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                7
              </span>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Electronic Signature & Compliance Certification</h2>
                <p className="text-xs text-slate-400 font-normal">
                  {isSubmitted
                    ? 'This electronic signature has been officially certified and submitted with Form W-9. Once submitted, it is locked.'
                    : 'By signing below, you are electronically signing this Form W-9 under penalties of perjury.'}
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <span
                id="w9-signature-locked-status-pill"
                className="text-xs text-slate-600 font-bold flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Signature Submitted & Locked
              </span>
            ) : (hasSignature || signatureImage) ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Signature Captured ✓
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-bold flex items-center gap-1 self-start sm:self-auto">
                <AlertTriangle className="w-3.5 h-3.5" /> Signature Required *
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Legal Name (Signature) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitted}
                  id="w9-electronic-signature-input"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3.5 py-2.5 bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-start gap-2.5 pt-6">
                <input
                  type="checkbox"
                  id="w9-perjury-agreement-checkbox"
                  checked={agreedPerjury}
                  disabled={isSubmitted}
                  onChange={(e) => setAgreedPerjury(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer w-4 h-4 disabled:cursor-not-allowed"
                />
                <label htmlFor="w9-perjury-agreement-checkbox" className="text-xs text-slate-800 cursor-pointer select-none leading-relaxed font-semibold">
                  I agree to electronically sign this Form W-9 under penalties of perjury.
                  <span className="text-[11px] text-slate-500 block font-normal mt-0.5">
                    By checking this box and submitting, I confirm that the information provided is true, correct, and complete to the best of my knowledge.
                  </span>
                </label>
              </div>
            </div>

            {/* Signature Canvas / Locked Signature Card */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Authorized Signer: <span className="text-slate-900 font-semibold">{signatureName || 'Authorized Signer'}</span>
                </span>
                {isSubmitted ? (
                  <span
                    id="w9-signature-locked-badge"
                    className="text-xs font-bold text-slate-500 flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Non-Editable (Form W-9 Submitted)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    id="btn-clear-w9-signature"
                    onClick={handleClearSignature}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Signature</span>
                  </button>
                )}
              </div>

              {isSubmitted ? (
                <div
                  id="w9-signature-locked-card"
                  className="relative rounded-2xl border-2 border-slate-200 bg-slate-50/85 p-6 overflow-hidden flex flex-col items-center justify-center min-h-[170px] shadow-2xs"
                >
                  {/* Official Record Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-slate-700 shadow-2xs">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>OFFICIAL SIGNATURE RECORD</span>
                  </div>

                  {signatureImage ? (
                    <div className="w-full flex flex-col items-center justify-center py-2">
                      <img
                        id="w9-submitted-signature-image"
                        src={signatureImage}
                        alt="Submitted Electronic Signature"
                        className="max-h-24 max-w-full object-contain pointer-events-none select-none my-1"
                      />
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">
                        Signature Certified by {signatureName || 'Authorized Signer'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Digital electronic signature locked and archived with Form W-9 certification.
                      </p>
                    </div>
                  )}

                  {/* Certified baseline info */}
                  <div className="w-full border-t border-slate-300 pt-2.5 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Certified under penalties of perjury by {signatureName || 'Authorized Signer'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Certified: {business.w9?.signedAt ? new Date(business.w9.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Archived with submission'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 overflow-hidden hover:border-slate-400 transition-colors">
                  <canvas
                    id="w9-signature-canvas"
                    ref={canvasRef}
                    width={700}
                    height={170}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    style={{ touchAction: 'none' }}
                    className="w-full h-40 touch-none cursor-crosshair block bg-transparent select-none"
                  />

                  {/* Baseline guideline */}
                  <div className="absolute left-6 right-6 bottom-8 pointer-events-none border-b border-slate-300 flex items-center justify-between text-[10px] text-slate-400 pb-1">
                    <span className="font-mono text-slate-400">✕ Sign on the line above</span>
                    <span className="font-semibold text-slate-500">
                      Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {!hasSignature && !isDrawing && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                      <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <PenTool className="w-3.5 h-3.5 text-slate-500" />
                        <span>Click or touch to sign here</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Terms and conditions link directly below canvas */}
              <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>By signing above, you certify under penalties of perjury and agree to the</span>
                <button
                  type="button"
                  id="btn-open-w9-terms"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer transition-colors"
                >
                  Terms and Conditions
                </button>
                <span>(IRS Form W-9 Instructions & Certifications).</span>
              </div>
            </div>

            {/* Blue Audit Callout Banner matching Image 1 */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Your IP address and device information will be recorded for audit purposes.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {isSubmitted ? (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Certified Form W-9</span>
              </button>

              <div className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Form W-9 Certified & Submitted</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  id="btn-export-w9-pdf"
                  onClick={handleDownloadPdf}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                  title="Export Form W-9 as PDF"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Export PDF</span>
                </button>
              </div>

              <button
                type="submit"
                id="btn-sign-and-submit-w9"
                disabled={!isKycApproved || !isPlanSelected}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign & Submit W-9</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Card / Footer Notice */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">After Submission</h4>
              <p className="text-[11px] text-slate-500">
                We will generate a signed W-9 PDF for our records. You will be able to download a copy from your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">Secure & Encrypted</span>
              <span className="text-[10px] text-emerald-700 block">Your information is protected</span>
            </div>
          </div>
        </div>
      </form>

      {/* Terms & Conditions Modal with complete Form W-9 details */}
      <W9TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};
export default W9TaxCertification;
