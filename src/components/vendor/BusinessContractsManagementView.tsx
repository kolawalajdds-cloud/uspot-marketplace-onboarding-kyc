import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Download,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Search,
  Filter,
  Send,
  X,
  FileCheck2,
  Eye,
  RefreshCw,
  Building,
} from 'lucide-react';
import { ESignatureContract, Business } from '../../types';
import { contractSigningService } from '../../services/contractSigningService';
import { CertificateOfCompletionModal } from '../common/CertificateOfCompletionModal';
import { AuditTrailModal } from '../common/AuditTrailModal';
import { ContractDocumentViewerModal } from '../common/ContractDocumentViewerModal';

interface BusinessContractsManagementViewProps {
  business: Business;
  rosterWorkers?: Array<{ id: string; name: string; email?: string }>;
}

export const BusinessContractsManagementView: React.FC<BusinessContractsManagementViewProps> = ({
  business,
  rosterWorkers = [],
}) => {
  const businessId = business.id || 'biz-salon-01';
  const businessName =
    business.coreDetails?.businessName || (business as any)?.name || 'Glow Salon & Hair Studio';

  const [contracts, setContracts] = useState<ESignatureContract[]>(() =>
    contractSigningService.getContractsForBusiness(businessId)
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Create Contract Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Commercial Specialist & Facility Agreement');
  const [newContractType, setNewContractType] = useState('independent_contractor');
  const [selectedWorkerId, setSelectedWorkerId] = useState('user-specialist');
  const [workerCustomName, setWorkerCustomName] = useState('John Doe');
  const [workerCustomEmail, setWorkerCustomEmail] = useState('john.doe@uspot.com');
  const [newPayAmount, setNewPayAmount] = useState('$1,500.00');
  const [newHourlyRate, setNewHourlyRate] = useState('85');
  const [newFrequency, setNewFrequency] = useState<'Weekly' | 'Monthly' | 'Bi-weekly'>('Weekly');
  const [newCommission, setNewCommission] = useState('20%');
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('Ongoing');
  const [newLocation, setNewLocation] = useState(
    business.coreDetails?.businessAddress?.city
      ? `${business.coreDetails.businessAddress.city}, ${business.coreDetails.businessAddress.state}`
      : 'New York, NY'
  );
  const [newReportingTo, setNewReportingTo] = useState('Operations Manager');
  const [newSlaTerms, setNewSlaTerms] = useState(
    `1. APPOINTMENT & SCOPE OF SERVICES
The Service Provider (Specialist) agrees to provide scheduled professional services for ${businessName}. All assignments are tracked and managed through the URSPOT platform.

2. COMPENSATION & DISBURSEMENT
Payment shall be calculated based on the agreed rate and disbursed weekly via direct ACH deposit. Invoices and tax reporting are automatically synchronized.

3. QUALITY OF SERVICE & COMPLIANCE
Specialist agrees to maintain active licensing, background check verification, and observe all host safety protocols.`
  );

  // Sub-Modals
  const [selectedCertContract, setSelectedCertContract] = useState<ESignatureContract | null>(null);
  const [selectedAuditContract, setSelectedAuditContract] = useState<ESignatureContract | null>(null);
  const [selectedDocContract, setSelectedDocContract] = useState<ESignatureContract | null>(null);

  const refreshContracts = () => {
    const list = contractSigningService.getContractsForBusiness(businessId);
    setContracts(list);
  };

  useEffect(() => {
    refreshContracts();
  }, [businessId]);

  // Filtered list
  const filteredContracts = contracts.filter((c) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'pending'
        ? c.status === 'SENT_FOR_SIGNATURE' ||
          c.status === 'VIEWED' ||
          c.status === 'CONSENTED' ||
          c.status === 'AUTHENTICATED' ||
          c.status === 'SIGNATURE_CAPTURED'
        : activeFilter === 'completed'
        ? c.status === 'COMPLETED' || c.status === 'SIGNED'
        : c.status === 'DRAFT';

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = contracts.filter(
    (c) =>
      c.status === 'SENT_FOR_SIGNATURE' ||
      c.status === 'VIEWED' ||
      c.status === 'CONSENTED' ||
      c.status === 'AUTHENTICATED' ||
      c.status === 'SIGNATURE_CAPTURED'
  ).length;

  const completedCount = contracts.filter(
    (c) => c.status === 'COMPLETED' || c.status === 'SIGNED'
  ).length;

  const handleCreateSubmit = (sendImmediately: boolean) => {
    try {
      const created = contractSigningService.createAndAssignContract(
        {
          title: newTitle,
          contractType: newContractType,
          businessId,
          businessName,
          businessEmail: 'operations@uspot.com',
          businessPhone: '+1 (555) 000-8800',
          businessAddress: newLocation,
          workerId: selectedWorkerId,
          workerName: workerCustomName,
          workerEmail: workerCustomEmail,
          payAmount: newPayAmount,
          hourlyRate: Number(newHourlyRate) || 85,
          frequency: newFrequency,
          commissionRate: newCommission,
          startDate: newStartDate,
          endDate: newEndDate,
          primaryLocation: newLocation,
          reportingTo: newReportingTo,
          slaTerms: newSlaTerms,
        },
        sendImmediately
      );

      refreshContracts();
      setIsCreateModalOpen(false);
      setSuccessToast(
        sendImmediately
          ? `Contract ${created.id} created and dispatched to ${created.workerName} for electronic signature!`
          : `Contract ${created.id} saved as draft.`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error creating contract');
    }
  };

  const handleResendRequest = (contractId: string) => {
    try {
      contractSigningService.sendContractForSignature(contractId);
      refreshContracts();
      setSuccessToast(`Signature invitation re-sent to worker.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDownload = async (contract: ESignatureContract) => {
    await contractSigningService.downloadSignedContract(contract);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Stats Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Contracts & Electronic Signatures
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              URSPOT E-Sign
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, assign, send, and audit legally binding specialist agreements with cryptographic verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Assign Contract</span>
        </button>
      </div>

      {/* 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Contracts
          </span>
          <span className="text-2xl font-black text-slate-900 block">{contracts.length}</span>
          <span className="text-[11px] text-slate-500 font-medium">All agreements for {businessName}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Worker Signature
          </span>
          <span className="text-2xl font-black text-amber-600 block">{pendingCount}</span>
          <span className="text-[11px] text-slate-500 font-medium">Awaiting worker review and E-Sign</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Completed & Certified
          </span>
          <span className="text-2xl font-black text-emerald-600 block">{completedCount}</span>
          <span className="text-[11px] text-slate-500 font-medium">Cryptographically bound & signed</span>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {(['all', 'pending', 'completed', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                activeFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab === 'all'
                ? 'All'
                : tab === 'pending'
                ? `Pending Signature (${pendingCount})`
                : tab === 'completed'
                ? `Completed (${completedCount})`
                : 'Drafts'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contracts or worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">CONTRACT ID & TITLE</th>
                <th className="py-3 px-6">ASSIGNED WORKER</th>
                <th className="py-3 px-6">COMPENSATION</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">EXECUTION DETAILS</th>
                <th className="py-3 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No contracts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => {
                  const isPending =
                    c.status === 'SENT_FOR_SIGNATURE' ||
                    c.status === 'VIEWED' ||
                    c.status === 'CONSENTED' ||
                    c.status === 'AUTHENTICATED' ||
                    c.status === 'SIGNATURE_CAPTURED';
                  const isCompleted = c.status === 'COMPLETED' || c.status === 'SIGNED';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 truncate max-w-xs">{c.title}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{c.id}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-[11px]">
                            {c.workerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{c.workerName}</span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {c.workerEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 block">{c.payAmount}</span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {c.frequency} &bull; {c.contractType}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
                          {isCompleted ? 'COMPLETED' : 'PENDING SIGNATURE'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {isCompleted ? (
                          <div>
                            <span className="text-slate-800 font-medium block truncate">
                              Signed: {c.signedAt}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate max-w-xs">
                              Hash: {c.documentHash?.slice(0, 20)}...
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-amber-700 font-bold block">Awaiting Worker</span>
                            <span className="text-[10px] text-slate-400 block">Sent: {c.assignedAt || c.createdAt}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedDocContract(c)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                                title="View Document"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Download Signed PDF"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCertContract(c)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Certificate of Completion"
                              >
                                Certificate
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedAuditContract(c)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Audit Trail"
                              >
                                Audit
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedDocContract(c)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 bg-white text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                View Terms
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResendRequest(c.id)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Resend</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & ASSIGN CONTRACT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Create & Assign Contract</h3>
                  <p className="text-[11px] text-slate-400">
                    Draft a service contract and send for electronic signature
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              {/* Host Business (Readonly) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contracting Business</label>
                <input
                  type="text"
                  value={businessName}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
                />
              </div>

              {/* Title & Contract Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contract Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 font-medium"
                    placeholder="e.g. Master Service Agreement"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agreement Type</label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 font-medium"
                  >
                    <option value="independent_contractor">Independent Contractor (1099)</option>
                    <option value="w2_hourly">W2 Hourly Specialist</option>
                    <option value="master_service_agreement">Master Service Agreement (MSA)</option>
                    <option value="Commission">Commission Based</option>
                    <option value="Salary">Salary Based</option>
                  </select>
                </div>
              </div>

              {/* Worker Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Specialist</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedWorkerId(id);
                      if (id === 'user-specialist') {
                        setWorkerCustomName('John Doe');
                        setWorkerCustomEmail('john.doe@uspot.com');
                      } else {
                        const w = rosterWorkers.find((item) => item.id === id);
                        if (w) {
                          setWorkerCustomName(w.name);
                          setWorkerCustomEmail(w.email || `${w.name.toLowerCase().replace(/\s+/g, '.')}@uspot.com`);
                        }
                      }
                    }}
                    className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 bg-white font-medium"
                  >
                    <option value="user-specialist">John Doe (user-specialist)</option>
                    {rosterWorkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.id})
                      </option>
                    ))}
                    <option value="custom">Other / New Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Worker Full Name</label>
                  <input
                    type="text"
                    value={workerCustomName}
                    onChange={(e) => setWorkerCustomName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Worker Email</label>
                  <input
                    type="email"
                    value={workerCustomEmail}
                    onChange={(e) => setWorkerCustomEmail(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Compensation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pay Amount</label>
                  <input
                    type="text"
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hourly Equivalent ($)</label>
                  <input
                    type="number"
                    value={newHourlyRate}
                    onChange={(e) => setNewHourlyRate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commission %</label>
                  <input
                    type="text"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              {/* Dates & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="text"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              {/* SLA & Terms */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Agreement Terms, Deliverables & Scope of Work
                </label>
                <textarea
                  rows={4}
                  value={newSlaTerms}
                  onChange={(e) => setNewSlaTerms(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 font-mono text-[11px] leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateSubmit(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateSubmit(true)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Signature</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modals */}
      {selectedCertContract && (
        <CertificateOfCompletionModal
          contract={selectedCertContract}
          onClose={() => setSelectedCertContract(null)}
        />
      )}

      {selectedAuditContract && (
        <AuditTrailModal
          contract={selectedAuditContract}
          onClose={() => setSelectedAuditContract(null)}
        />
      )}

      {selectedDocContract && (
        <ContractDocumentViewerModal
          contract={selectedDocContract}
          onClose={() => setSelectedDocContract(null)}
        />
      )}
    </div>
  );
};
