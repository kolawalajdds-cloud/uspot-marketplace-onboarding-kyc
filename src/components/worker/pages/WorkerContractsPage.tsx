import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Plus,
  ArrowLeft,
  Building,
  Check,
  CheckCircle2,
  X,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Banknote,
  ClipboardCheck,
  FileCheck2,
  Info,
  ShieldCheck,
  PenTool,
  Lock,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ESignatureContract } from '../../../types';
import { contractSigningService } from '../../../services/contractSigningService';
import { WorkerSigningModal } from '../contract/WorkerSigningModal';
import { CertificateOfCompletionModal } from '../../common/CertificateOfCompletionModal';
import { AuditTrailModal } from '../../common/AuditTrailModal';
import { ContractDocumentViewerModal } from '../../common/ContractDocumentViewerModal';

interface WorkerContractsPageProps {
  workerId: string;
}

export const WorkerContractsPage: React.FC<WorkerContractsPageProps> = ({ workerId }) => {
  const [contracts, setContracts] = useState<ESignatureContract[]>(() =>
    contractSigningService.getContractsForWorker(workerId)
  );
  const [selectedContract, setSelectedContract] = useState<ESignatureContract | null>(null);
  const [activeFilter, setActiveFilter] = useState<'pending' | 'active' | 'expired' | 'all'>('pending');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals state
  const [signingModalContract, setSigningModalContract] = useState<ESignatureContract | null>(null);
  const [certificateModalContract, setCertificateModalContract] = useState<ESignatureContract | null>(null);
  const [auditModalContract, setAuditModalContract] = useState<ESignatureContract | null>(null);
  const [docViewerModalContract, setDocViewerModalContract] = useState<ESignatureContract | null>(null);

  // Load contracts on mount
  const refreshContracts = (updatedContract?: ESignatureContract) => {
    const list = contractSigningService.getContractsForWorker(workerId);
    setContracts(list);
    if (updatedContract) {
      setSelectedContract(updatedContract);
    } else if (selectedContract) {
      const updated = list.find((c) => c.id === selectedContract.id);
      if (updated) setSelectedContract(updated);
    }
  };

  useEffect(() => {
    refreshContracts();
  }, [workerId]);

  // Pending contracts that require signing
  const pendingContracts = contracts.filter(
    (c) =>
      c.status === 'SENT_FOR_SIGNATURE' ||
      c.status === 'VIEWED' ||
      c.status === 'CONSENTED' ||
      c.status === 'AUTHENTICATED' ||
      c.status === 'SIGNATURE_CAPTURED'
  );

  const activeContracts = contracts.filter((c) => c.status === 'COMPLETED' || c.status === 'SIGNED');

  // Filter list
  const filteredContracts = contracts.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') {
      return (
        c.status === 'SENT_FOR_SIGNATURE' ||
        c.status === 'VIEWED' ||
        c.status === 'CONSENTED' ||
        c.status === 'AUTHENTICATED' ||
        c.status === 'SIGNATURE_CAPTURED'
      );
    }
    if (activeFilter === 'active') return c.status === 'COMPLETED' || c.status === 'SIGNED';
    if (activeFilter === 'expired') return c.status === 'DRAFT';
    return true;
  });

  const handleSigningCompleted = (updated: ESignatureContract) => {
    setSigningModalContract(null); // Explicitly close signing modal
    refreshContracts(updated);
    setSelectedContract(updated);
    setActionNotice(`✓ Contract "${updated.title}" (${updated.id}) successfully signed! Cryptographic certificate issued and document secured.`);
    setTimeout(() => setActionNotice(null), 8000);
  };

  const handleDownloadPdf = async (contract: ESignatureContract) => {
    await contractSigningService.downloadSignedContract(contract);
  };

  const isPendingSignature =
    selectedContract?.status === 'SENT_FOR_SIGNATURE' ||
    selectedContract?.status === 'VIEWED' ||
    selectedContract?.status === 'CONSENTED' ||
    selectedContract?.status === 'AUTHENTICATED' ||
    selectedContract?.status === 'SIGNATURE_CAPTURED';

  const isCompleted =
    selectedContract?.status === 'COMPLETED' || selectedContract?.status === 'SIGNED';

  return (
    <div className="space-y-6 pb-12">
      {/* Prominent Success / Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500/80 text-emerald-950 rounded-2xl shadow-sm flex items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">Contract Successfully Signed & Executed</h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">{actionNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedContract ? (
        <div className="space-y-6">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedContract(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-800 hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-extrabold text-gray-900">My Contracts</span>
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-mono font-bold text-gray-500">
              ID: {selectedContract.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <>
                <button
                  type="button"
                  onClick={() => setCertificateModalContract(selectedContract)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuditModalContract(selectedContract)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Audit Trail</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedContract)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Business Header Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
              {selectedContract.businessName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {selectedContract.businessName}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isCompleted ? 'COMPLETED & CERTIFIED' : 'PENDING WORKER SIGNATURE'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedContract.location}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {selectedContract.businessEmail}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {selectedContract.businessPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isPendingSignature && (
              <button
                type="button"
                onClick={() => setSigningModalContract(selectedContract)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold transition-all shadow-md cursor-pointer animate-pulse hover:animate-none"
              >
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Review & Sign Contract</span>
              </button>
            )}

            {isCompleted && (
              <button
                type="button"
                onClick={() => setDocViewerModalContract(selectedContract)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>View Executed Document</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Step Progress Stepper */}
        <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs">
          <div className="grid grid-cols-4 relative text-center">
            {/* Step 1: SENT */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-gray-900 tracking-wider uppercase mt-2">
                SENT
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">{selectedContract.assignedAt || 'Recorded'}</span>
            </div>

            {/* Step 2: REVIEW */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedContract.viewedAt || isCompleted
                    ? 'bg-black text-white'
                    : 'border border-gray-300 bg-white text-gray-400'
                }`}
              >
                {selectedContract.viewedAt || isCompleted ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className="text-xs font-black text-gray-900 tracking-wider uppercase mt-2">
                REVIEWED
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {selectedContract.viewedAt ? 'Terms Inspected' : 'Pending'}
              </span>
            </div>

            {/* Step 3: SIGNED */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <span className="text-xs font-black text-gray-900 tracking-wider uppercase mt-2">
                E-SIGNED
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {isCompleted ? 'Cryptographically Bound' : 'Awaiting Signature'}
              </span>
            </div>

            {/* Step 4: ACTIVE */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : '4'}
              </div>
              <span className="text-xs font-bold text-gray-900 tracking-wider uppercase mt-2">
                COMPLETED
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {isCompleted ? 'Legally Active' : '--'}
              </span>
            </div>

            {/* Connecting line */}
            <div className="absolute top-3.5 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0" />
          </div>
        </div>

        {/* 2-Column Terms & Decision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Terms Card) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-700" />
                <h3 className="font-extrabold text-sm text-gray-900">Contract Agreement Terms</h3>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedContract)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-black cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  CONTRACT TYPE
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.contractType}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  PAY AMOUNT
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.payAmount}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  FREQUENCY
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.frequency}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  COMMISSION %
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.commissionRate || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  START DATE
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.startDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  END DATE
                </span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  {selectedContract.endDate}
                </span>
              </div>
            </div>

            {/* SLA Box */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-2">
                SERVICE LEVEL AGREEMENT & DELIVERABLES
              </span>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                {selectedContract.slaTerms}
              </p>
            </div>
          </div>

          {/* Right Column: Decision Card & Job Site Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* If pending: Awaiting Signature Card */}
            {isPendingSignature && (
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                    Action Required
                  </span>
                  <h4 className="font-extrabold text-base text-white tracking-tight">
                    Awaiting Your Signature
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">
                    This agreement requires review, electronic consent, identity verification, and your digital signature.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSigningModalContract(selectedContract)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Start E-Sign Workflow</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Average completion time: 2 minutes.</span>
                </div>
              </div>
            )}

            {/* If completed: Certificate of Completion Box */}
            {isCompleted && (
              <div className="bg-white border-2 border-emerald-500/80 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-extrabold text-sm tracking-tight">Contract Legally Executed</h4>
                </div>

                <div className="text-xs text-slate-600 space-y-2">
                  <p>
                    Signed At: <strong className="text-slate-900">{selectedContract.signedAt}</strong>
                  </p>
                  <p>
                    Auth: <strong className="text-slate-900">6-Digit OTP Verified</strong>
                  </p>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      SHA-256 Digest
                    </span>
                    <span className="font-mono text-[10px] text-slate-700 break-all block mt-0.5 bg-slate-50 p-1.5 rounded">
                      {selectedContract.documentHash?.slice(0, 32)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCertificateModalContract(selectedContract)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 hover:border-slate-800 text-xs font-bold text-slate-800 transition-colors"
                  >
                    View Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditModalContract(selectedContract)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 hover:border-slate-800 text-xs font-bold text-slate-800 transition-colors"
                  >
                    Audit Trail
                  </button>
                </div>
              </div>
            )}

            {/* Job Site Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-2xs space-y-4">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                JOB SITE INFORMATION
              </span>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    PRIMARY LOCATION
                  </span>
                  <span className="text-xs font-extrabold text-gray-900 mt-0.5 block">
                    {selectedContract.primaryLocation}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    REPORTING TO
                  </span>
                  <span className="text-xs font-extrabold text-gray-900 mt-0.5 block">
                    {selectedContract.reportingTo}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Seal */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 text-[11px] text-gray-500 font-medium">
              <Shield className="w-4 h-4 text-gray-600 shrink-0" />
              <span>Cryptographically secured & audited by URSPOT Enterprise Shield.</span>
            </div>
          </div>
        </div>

        {/* Status Change Log Table */}
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-gray-900">Contract Execution Audit Trail</h3>
            <span className="text-xs text-slate-500 font-medium font-mono">
              {selectedContract.auditTrail?.length || 0} events
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-3 px-6">TIMESTAMP</th>
                <th className="py-3 px-6">EVENT</th>
                <th className="py-3 px-6">ACTOR</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {selectedContract.auditTrail && selectedContract.auditTrail.length > 0 ? (
                selectedContract.auditTrail.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-6 font-bold text-gray-900 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-800">
                      {log.event.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-6">{log.userName || log.userId}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">{log.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
      <div className="space-y-6">
        {/* Pending Signature Notification Banner */}
        {pendingContracts.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Action Required
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300">
                  {pendingContracts.length} Pending
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                New contract available for signature from {pendingContracts[0].businessName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Contract ID: <span className="font-mono text-white font-bold">{pendingContracts[0].id}</span> &bull;{' '}
                {pendingContracts[0].title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSigningModalContract(pendingContracts[0])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <PenTool className="w-4 h-4" />
            <span>Review & Sign Contract</span>
          </button>
        </div>
      )}

      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Contracts</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Review, sign, and manage your professional service agreements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (contracts.length > 0) handleDownloadPdf(contracts[0]);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 text-xs font-semibold">
        {(['pending', 'active', 'all'] as const).map((tab) => {
          const count =
            tab === 'pending'
              ? pendingContracts.length
              : tab === 'active'
              ? activeContracts.length
              : contracts.length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`pb-3 capitalize transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab
                  ? 'text-black border-b-2 border-black font-bold'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              <span>{tab === 'pending' ? 'Pending Signature' : tab === 'active' ? 'Active / Completed' : 'All Contracts'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600 font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">BUSINESS</th>
                <th className="py-3.5 px-6">CONTRACT TITLE & ID</th>
                <th className="py-3.5 px-6">PAY AMOUNT</th>
                <th className="py-3.5 px-6">FREQUENCY</th>
                <th className="py-3.5 px-6">EFFECTIVE DATES</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {filteredContracts.map((c) => {
                const isPending =
                  c.status === 'SENT_FOR_SIGNATURE' ||
                  c.status === 'VIEWED' ||
                  c.status === 'CONSENTED' ||
                  c.status === 'AUTHENTICATED' ||
                  c.status === 'SIGNATURE_CAPTURED';

                const isCompleted = c.status === 'COMPLETED' || c.status === 'SIGNED';

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContract(c)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-800 flex items-center justify-center text-xs shrink-0">
                          {c.businessName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-gray-900">{c.businessName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 block truncate max-w-xs">{c.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{c.id}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-gray-900">{c.payAmount}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{c.frequency}</td>
                    <td className="py-4 px-6 text-gray-900 font-semibold">
                      {c.startDate} - {c.endDate}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block uppercase ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : isPending
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isCompleted ? 'COMPLETED' : 'PENDING SIGNATURE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSigningModalContract(c);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Review & Sign</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContract(c);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Total Revenue */}
        <div className="bg-black text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              TOTAL CONTRACT REVENUE (YTD)
            </span>
            <Banknote className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white tracking-tight block">
              $42,850.00
            </span>
            <span className="text-[11px] font-semibold text-neutral-400 mt-1 block">
              +12% from previous year
            </span>
          </div>
        </div>

        {/* Card 2: Active Contracts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              ACTIVE CONTRACTS
            </span>
            <span className="text-3xl font-black text-gray-900 tracking-tight block mt-0.5">
              {activeContracts.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="bg-white rounded-xl p-6 border border-gray-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              PENDING SIGNATURE
            </span>
            <span className="text-3xl font-black text-gray-900 tracking-tight block mt-0.5">
              {pendingContracts.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Modals */}
      {signingModalContract && (
        <WorkerSigningModal
          contract={signingModalContract}
          workerId={workerId}
          workerName={signingModalContract.workerName}
          workerEmail={signingModalContract.workerEmail}
          onClose={() => setSigningModalContract(null)}
          onSigningComplete={handleSigningCompleted}
        />
      )}

      {certificateModalContract && (
        <CertificateOfCompletionModal
          contract={certificateModalContract}
          onClose={() => setCertificateModalContract(null)}
        />
      )}

      {auditModalContract && (
        <AuditTrailModal
          contract={auditModalContract}
          onClose={() => setAuditModalContract(null)}
        />
      )}

      {docViewerModalContract && (
        <ContractDocumentViewerModal
          contract={docViewerModalContract}
          onClose={() => setDocViewerModalContract(null)}
        />
      )}
    </div>
  );
};
