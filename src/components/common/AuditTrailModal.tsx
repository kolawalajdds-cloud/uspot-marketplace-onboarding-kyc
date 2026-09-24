import React from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  Clock,
  Shield,
  User,
  Laptop,
  Check,
  Globe,
  ArrowDown,
} from 'lucide-react';
import { ESignatureContract, AuditEvent } from '../../types';

interface AuditTrailModalProps {
  contract: ESignatureContract;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ contract, onClose }) => {
  const getEventBadge = (event: string) => {
    switch (event) {
      case 'CONTRACT_CREATED':
        return { label: 'Contract Created', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'CONTRACT_ASSIGNED':
        return { label: 'Contract Assigned', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'SIGNATURE_REQUEST_SENT':
        return { label: 'Signature Request Sent', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'CONTRACT_OPENED':
      case 'CONTRACT_REVIEWED':
        return { label: 'Contract Reviewed', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ELECTRONIC_CONSENT_PROVIDED':
        return { label: 'Electronic Consent', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'AUTHENTICATION_INITIATED':
      case 'AUTHENTICATION_SUCCESSFUL':
        return { label: 'Identity Authenticated', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'SIGNATURE_CAPTURED':
        return { label: 'Signature Captured', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'SIGNATURE_CONFIRMED':
        return { label: 'Signature Confirmed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'CONTRACT_SIGNED':
        return { label: 'Contract Signed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'SIGNED_PDF_GENERATED':
        return { label: 'Signed PDF Generated', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'DOCUMENT_HASH_GENERATED':
        return { label: 'Document Hash Generated', color: 'bg-violet-50 text-violet-800 border-violet-200' };
      case 'SIGNING_COMPLETED':
        return { label: 'Signing Completed', color: 'bg-emerald-600 text-white border-emerald-700' };
      default:
        return { label: event.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
                Immutable Signing Audit Log
              </span>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Signing Session Audit Trail
              </h2>
            </div>
          </div>
        </div>

        {/* Contract Info Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Contract ID</span>
            <span className="font-mono font-bold text-slate-900">{contract.id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Worker / Signer</span>
            <span className="font-bold text-slate-900">{contract.workerName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Audit Events</span>
            <span className="font-bold text-slate-900">{contract.auditTrail?.length || 0} Events Recorded</span>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {contract.auditTrail && contract.auditTrail.length > 0 ? (
              contract.auditTrail.map((ev, idx) => {
                const badge = getEventBadge(ev.event);
                const isCompletedEvent = ev.event === 'SIGNING_COMPLETED' || ev.event === 'CONTRACT_SIGNED';

                return (
                  <div key={ev.id || idx} className="relative group">
                    {/* Timeline bullet */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 ring-4 ring-white ${
                        isCompletedEvent
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-900 text-slate-900'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>

                    {/* Event Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-2 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-800">{ev.description}</p>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Actor: <strong className="text-slate-700">{ev.userName || ev.userId}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate font-mono">
                            IP: <strong className="text-slate-700">{ev.ipAddress}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No audit events found.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
