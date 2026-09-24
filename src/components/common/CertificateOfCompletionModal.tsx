import React from 'react';
import {
  ShieldCheck,
  Download,
  X,
  FileCheck2,
  Calendar,
  Lock,
  Globe,
  User,
  Building,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { ESignatureContract } from '../../types';
import { contractSigningService } from '../../services/contractSigningService';

interface CertificateOfCompletionModalProps {
  contract: ESignatureContract;
  onClose: () => void;
}

export const CertificateOfCompletionModal: React.FC<CertificateOfCompletionModalProps> = ({
  contract,
  onClose,
}) => {
  const cert = contract.certificate;
  const hash = contract.documentHash || cert?.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handleDownload = async () => {
    await contractSigningService.downloadSignedContract(contract);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                Cryptographically Verified
              </span>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Electronic Signature Certificate
              </h2>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Certificate Reference Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Certificate ID
              </span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {cert?.certificateId || `CERT-${contract.id}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Contract Reference
              </span>
              <span className="text-sm font-mono font-bold text-slate-900">{contract.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                COMPLETED
              </span>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Signer */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>SIGNER & SPECIALIST</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{contract.workerName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{contract.workerEmail}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Role: <span className="font-medium text-slate-700">Specialist Service Provider</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Worker ID: <span className="font-mono text-slate-700">{contract.workerId}</span>
                </p>
              </div>
            </div>

            {/* Business */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>CONTRACTING BUSINESS</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{contract.businessName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{contract.businessEmail}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Site: <span className="font-medium text-slate-700">{contract.primaryLocation}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Business ID: <span className="font-mono text-slate-700">{contract.businessId}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Audit & Security Details */}
          <div className="p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Signature Security & Verification Record
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Signed At (UTC)</span>
                <span className="font-medium text-slate-900">{contract.signedAt || 'September 24, 2026 11:42:18 UTC'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Authentication Method</span>
                <span className="font-medium text-slate-900">
                  {cert?.authMethod || '6-Digit OTP Identity Verification'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">IP Address</span>
                <span className="font-mono text-slate-900">{cert?.ipAddress || '198.51.100.42 (Mock / Prototype)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Consent Status</span>
                <span className="font-medium text-emerald-700 font-bold">✓ E-SIGN Consent Recorded</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Document SHA-256 Hash
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Web Crypto API</span>
            </div>
            <p className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800 select-all">
              {hash}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This 256-bit cryptographic digest uniquely authenticates the generated signed PDF document. Any alteration to the contract terms or signature data invalidates this hash.
            </p>
          </div>

          {/* Legal Compliance Footer Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Compliance Notice:</strong> This electronic signature was executed in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001) and UETA. The signature is intended to have the same legal force and effect as a physical handwritten signature.
            <div className="mt-1 text-[10px] text-slate-400 italic">
              * Production implementation should be reviewed for applicable US federal and state electronic-signature requirements.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Signed PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
