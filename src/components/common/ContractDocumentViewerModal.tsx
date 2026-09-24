import React from 'react';
import {
  FileText,
  X,
  Download,
  Building,
  User,
  ShieldCheck,
  Calendar,
  DollarSign,
  MapPin,
  Lock,
} from 'lucide-react';
import { ESignatureContract } from '../../types';
import { contractSigningService } from '../../services/contractSigningService';

interface ContractDocumentViewerModalProps {
  contract: ESignatureContract;
  onClose: () => void;
}

export const ContractDocumentViewerModal: React.FC<ContractDocumentViewerModalProps> = ({
  contract,
  onClose,
}) => {
  const isSigned = contract.status === 'COMPLETED' || contract.status === 'SIGNED';

  const handleDownload = async () => {
    await contractSigningService.downloadSignedContract(contract);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
              DOC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">{contract.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {contract.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {contract.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans text-xs bg-slate-50/50">
          {/* Document Header Sheet */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Official Contract Agreement
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {contract.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Executed via URSPOT Marketplace Automated Contracting Platform
              </p>
            </div>

            {/* Parties Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Host Business
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{contract.businessName}</p>
                <p className="text-xs text-slate-600 mt-0.5">{contract.businessAddress}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {contract.businessEmail} &bull; {contract.businessPhone}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Specialist / Worker
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{contract.workerName}</p>
                <p className="text-xs text-slate-600 mt-0.5">{contract.primaryLocation}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {contract.workerEmail} &bull; {contract.workerPhone}
                </p>
              </div>
            </div>

            {/* Key Agreement Terms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contract Type
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.contractType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pay Amount
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.payAmount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Frequency
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">{contract.frequency}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Effective Dates
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block">
                  {contract.startDate} - {contract.endDate}
                </span>
              </div>
            </div>

            {/* SLA Terms & Deliverables */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Scope of Work, SLA, and Platform Obligations
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                {contract.slaTerms}
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Execution & Signatures
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Host Signature */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Host Business Representative
                  </span>
                  <div className="h-16 flex items-end font-serif italic text-lg text-slate-800 pb-1 border-b border-slate-300">
                    {contract.businessName} Auth
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <p className="font-bold text-slate-900">{contract.reportingTo}</p>
                    <p>Status: Pre-authorized by Business</p>
                  </div>
                </div>

                {/* Worker Electronic Signature */}
                <div className="p-4 rounded-xl border-2 border-slate-900 bg-white space-y-2 relative shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Specialist Electronic Signature
                  </span>

                  <div className="h-16 flex items-center justify-start pb-1 border-b border-slate-300 overflow-hidden">
                    {contract.signature?.processedData || contract.signature?.data ? (
                      <img
                        src={contract.signature.processedData || contract.signature.data}
                        alt="Signature"
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-serif italic text-lg text-slate-800">
                        {contract.workerName}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-900">{contract.workerName}</p>
                    <p className="text-slate-600">
                      Signed At: <strong className="text-slate-800">{contract.signedAt || 'Pending'}</strong>
                    </p>
                    {contract.documentHash && (
                      <p className="font-mono text-[9px] text-slate-400 truncate">
                        Hash: {contract.documentHash}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed & secured by URSPOT Enterprise Shield</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Contract PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
