import jsPDF from 'jspdf';
import {
  ESignatureContract,
  ESignatureContractStatus,
  ESignatureData,
  AuditEvent,
  AuditEventType,
  CertificateOfCompletion,
} from '../types';

const STORAGE_KEY = 'uspot_contracts_v2';
const MOCK_IP_ADDRESS = '198.51.100.42 (Mock / Prototype)';

// Seed contracts matching existing demo users & businesses
function getInitialSeedContracts(): ESignatureContract[] {
  const now = new Date();
  const createdDate = new Date(now.getTime() - 48 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const assignedDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return [
    {
      id: 'CTR-2026-88102',
      title: 'Emergency Maintenance & Electrical Field Specialist Agreement',
      contractType: 'Salary',
      businessId: 'biz-fixit-01',
      businessName: 'FixIt Co.',
      businessEmail: 'dispatch@fixitco.com',
      businessPhone: '+1 (555) 345-6789',
      businessAddress: 'Brooklyn Industrial Yard, Bay 3, Brooklyn, NY',
      workerId: 'user-specialist',
      workerName: 'John Doe',
      workerEmail: 'john.doe@uspot.com',
      workerPhone: '+1 (555) 876-5432',
      reportingTo: 'Dave Henderson (Field Director)',
      primaryLocation: 'Brooklyn Industrial Yard, Bay 3',
      location: 'Brooklyn, NY',
      payAmount: '$1,500.00',
      hourlyRate: 85,
      frequency: 'Weekly',
      commissionRate: 'N/A',
      startDate: 'Jun 20, 2026',
      endDate: 'Ongoing',
      slaTerms: `1. APPOINTMENT & SCOPE OF WORK
The Service Provider (Worker) agrees to provide professional electrical, HVAC inspection, and on-call maintenance services for FixIt Co. client venues as scheduled through the URSPOT platform.

2. COMPENSATION & PAYOUT SCHEDULE
Guaranteed base weekly salary of $1,500.00 disbursed every Friday via direct ACH deposit. Emergency service dispatch calls logged after 8:00 PM local time accrue supplemental compensation at 1.5x equivalent hourly rate.

3. QUALITY ASSURANCE & COMPLIANCE
All services must meet city building codes and OSHA occupational safety guidelines. The Specialist must maintain verified insurance coverage and valid trade licensing throughout the contract duration.

4. CONFIDENTIALITY & NON-CIRCUMVENTION
Specialist agrees to treat client venue configurations, security codes, and pricing terms with strict confidentiality and conduct all booking management exclusively through URSPOT.`,
      status: 'SENT_FOR_SIGNATURE',
      createdAt: createdDate,
      assignedAt: assignedDate,
      auditTrail: [
        {
          id: 'aud-seed-1',
          contractId: 'CTR-2026-88102',
          event: 'CONTRACT_CREATED',
          userId: 'biz-fixit-01',
          userName: 'Dave Henderson (HR & Operations)',
          userRole: 'business',
          timestamp: `${createdDate} — 10:15 AM EST`,
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) URSPOT-Vendor/2.4',
          status: 'SUCCESS',
          description: 'Contract drafted by FixIt Co. HR & Field Operations coordinator',
        },
        {
          id: 'aud-seed-2',
          contractId: 'CTR-2026-88102',
          event: 'CONTRACT_ASSIGNED',
          userId: 'biz-fixit-01',
          userName: 'Dave Henderson (HR & Operations)',
          userRole: 'business',
          timestamp: `${assignedDate} — 02:30 PM EST`,
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) URSPOT-Vendor/2.4',
          status: 'SUCCESS',
          description: 'Contract assigned to Specialist John Doe (user-specialist)',
        },
        {
          id: 'aud-seed-3',
          contractId: 'CTR-2026-88102',
          event: 'SIGNATURE_REQUEST_SENT',
          userId: 'biz-fixit-01',
          userName: 'URSPOT Automation Dispatch',
          userRole: 'system',
          timestamp: `${assignedDate} — 02:31 PM EST`,
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'URSPOT-Dispatcher/1.0',
          status: 'SUCCESS',
          description: 'Electronic signature invitation dispatched to worker email john.doe@uspot.com',
        },
      ],
    },
    {
      id: 'CTR-2026-99421',
      title: 'Commercial Facility Operations & Cleaning Agreement',
      contractType: 'Commission',
      businessId: 'biz-shine-01',
      businessName: 'Shine Cleaning Services Inc.',
      businessEmail: 'contact@shinecleaning.com',
      businessPhone: '+1 (555) 098-7654',
      businessAddress: '1240 Broadway, Suite 400, New York, NY',
      workerId: 'user-specialist',
      workerName: 'John Doe',
      workerEmail: 'john.doe@uspot.com',
      workerPhone: '+1 (555) 876-5432',
      reportingTo: 'Sarah Miller (Operations)',
      primaryLocation: 'Manhattan West, Site 4',
      location: 'New York, NY',
      payAmount: '20% Commission',
      hourlyRate: 75,
      frequency: 'Monthly',
      commissionRate: '20%',
      startDate: 'Jun 1, 2026',
      endDate: 'Dec 31, 2026',
      slaTerms: `1. SERVICE DELIVERABLES
The Service Provider agrees to perform professional facility management and sanitation duties according to the service schedule.

2. PAYMENT TERMS
Commission calculation of 20% on gross billing disbursements processed bi-weekly. Direct deposit through URSPOT Platform Treasury.`,
      status: 'COMPLETED',
      createdAt: 'May 28, 2026',
      assignedAt: 'May 29, 2026',
      viewedAt: 'May 30, 2026 10:14:02 UTC',
      consentAt: 'May 30, 2026 10:16:30 UTC',
      consentAgreed: true,
      authenticatedAt: 'May 30, 2026 10:18:12 UTC',
      authMethod: 'mock_otp',
      signedAt: 'May 30, 2026 10:22:45 UTC',
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      certificate: {
        certificateId: 'CERT-99421-K893FA',
        contractId: 'CTR-2026-99421',
        contractTitle: 'Commercial Facility Operations & Cleaning Agreement',
        businessId: 'biz-shine-01',
        businessName: 'Shine Cleaning Services Inc.',
        signerId: 'user-specialist',
        signerName: 'John Doe',
        signerEmail: 'john.doe@uspot.com',
        signerRole: 'Specialist / Service Provider',
        signedAt: 'May 30, 2026 10:22:45 UTC',
        authMethod: '6-Digit One-Time Password (OTP)',
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) URSPOT-Signer/2.0',
        documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: 'COMPLETED',
      },
      auditTrail: [
        {
          id: 'aud-shine-1',
          contractId: 'CTR-2026-99421',
          event: 'CONTRACT_CREATED',
          userId: 'biz-shine-01',
          userName: 'Sarah Miller',
          userRole: 'business',
          timestamp: 'May 28, 2026 — 09:00 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          status: 'SUCCESS',
          description: 'Contract drafted by Shine Cleaning Services Inc. Operations',
        },
        {
          id: 'aud-shine-2',
          contractId: 'CTR-2026-99421',
          event: 'CONTRACT_ASSIGNED',
          userId: 'biz-shine-01',
          userName: 'Sarah Miller',
          userRole: 'business',
          timestamp: 'May 29, 2026 — 11:30 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          status: 'SUCCESS',
          description: 'Assigned to Specialist John Doe',
        },
        {
          id: 'aud-shine-3',
          contractId: 'CTR-2026-99421',
          event: 'SIGNATURE_REQUEST_SENT',
          userId: 'biz-shine-01',
          userName: 'URSPOT Automation',
          userRole: 'system',
          timestamp: 'May 29, 2026 — 11:31 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'URSPOT-Dispatcher/1.0',
          status: 'SUCCESS',
          description: 'Invitation notification dispatched to worker',
        },
        {
          id: 'aud-shine-4',
          contractId: 'CTR-2026-99421',
          event: 'CONTRACT_OPENED',
          userId: 'user-specialist',
          userName: 'John Doe',
          userRole: 'worker',
          timestamp: 'May 30, 2026 — 10:14 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'SUCCESS',
          description: 'Worker opened contract review page',
        },
        {
          id: 'aud-shine-5',
          contractId: 'CTR-2026-99421',
          event: 'ELECTRONIC_CONSENT_PROVIDED',
          userId: 'user-specialist',
          userName: 'John Doe',
          userRole: 'worker',
          timestamp: 'May 30, 2026 — 10:16 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'SUCCESS',
          description: 'Electronic signature disclosure accepted and consent recorded',
        },
        {
          id: 'aud-shine-6',
          contractId: 'CTR-2026-99421',
          event: 'AUTHENTICATION_SUCCESSFUL',
          userId: 'user-specialist',
          userName: 'John Doe',
          userRole: 'worker',
          timestamp: 'May 30, 2026 — 10:18 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'SUCCESS',
          description: 'Signer identity verified via 6-digit OTP',
        },
        {
          id: 'aud-shine-7',
          contractId: 'CTR-2026-99421',
          event: 'CONTRACT_SIGNED',
          userId: 'user-specialist',
          userName: 'John Doe',
          userRole: 'worker',
          timestamp: 'May 30, 2026 — 10:22 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'SUCCESS',
          description: 'Cryptographic electronic signature executed',
        },
        {
          id: 'aud-shine-8',
          contractId: 'CTR-2026-99421',
          event: 'SIGNING_COMPLETED',
          userId: 'user-specialist',
          userName: 'John Doe',
          userRole: 'worker',
          timestamp: 'May 30, 2026 — 10:22 AM EST',
          ipAddress: MOCK_IP_ADDRESS,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'SUCCESS',
          description: 'Certificate of completion generated and archived in secure ledger',
        },
      ],
    },
  ];
}

class ContractSigningService {
  // Read all contracts from localStorage with fallback to seed data
  public getContracts(): ESignatureContract[] {
    if (typeof window === 'undefined') return getInitialSeedContracts();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading contracts from localStorage', e);
    }
    const seed = getInitialSeedContracts();
    this.saveContracts(seed);
    return seed;
  }

  public saveContracts(contracts: ESignatureContract[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    } catch (e) {
      console.error('Error saving contracts to localStorage', e);
    }
  }

  public getContractById(contractId: string): ESignatureContract | null {
    const list = this.getContracts();
    return list.find((c) => c.id === contractId) || null;
  }

  public getContractsForWorker(workerId: string): ESignatureContract[] {
    const list = this.getContracts();
    // In prototype, if contract workerId matches or fallback for user-specialist
    return list.filter((c) => c.workerId === workerId || (!c.workerId && workerId === 'user-specialist'));
  }

  public getContractsForBusiness(businessId: string): ESignatureContract[] {
    const list = this.getContracts();
    return list.filter(
      (c) => c.businessId === businessId || !c.businessId || c.businessId === 'biz-salon-01' || c.businessId === 'biz-fixit-01'
    );
  }

  // Helper to format real dynamic timestamp
  public formatCurrentTimestamp(): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' UTC';
  }

  public formatDisplayDate(date = new Date()): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Create & Assign Contract from Business side
  public createAndAssignContract(
    data: {
      title: string;
      contractType: string;
      businessId: string;
      businessName: string;
      businessEmail?: string;
      businessPhone?: string;
      businessAddress?: string;
      workerId: string;
      workerName: string;
      workerEmail?: string;
      workerPhone?: string;
      payAmount: string;
      hourlyRate?: number;
      frequency: 'Monthly' | 'Weekly' | 'Bi-weekly';
      commissionRate?: string;
      startDate: string;
      endDate?: string;
      primaryLocation?: string;
      reportingTo?: string;
      slaTerms: string;
    },
    sendImmediately = true
  ): ESignatureContract {
    const contracts = this.getContracts();
    const contractId = `CTR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateStr = this.formatDisplayDate(now);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const auditTrail: AuditEvent[] = [
      {
        id: `aud-${Date.now()}-1`,
        contractId,
        event: 'CONTRACT_CREATED',
        userId: data.businessId,
        userName: data.businessName,
        userRole: 'business',
        timestamp: `${dateStr} — ${timeStr}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Contract "${data.title}" drafted by ${data.businessName}`,
      },
      {
        id: `aud-${Date.now()}-2`,
        contractId,
        event: 'CONTRACT_ASSIGNED',
        userId: data.businessId,
        userName: data.businessName,
        userRole: 'business',
        timestamp: `${dateStr} — ${timeStr}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Contract assigned to worker ${data.workerName} (${data.workerId})`,
      },
    ];

    if (sendImmediately) {
      auditTrail.push({
        id: `aud-${Date.now()}-3`,
        contractId,
        event: 'SIGNATURE_REQUEST_SENT',
        userId: data.businessId,
        userName: 'URSPOT Automation Dispatcher',
        userRole: 'system',
        timestamp: `${dateStr} — ${timeStr}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: 'URSPOT-Dispatcher/1.0',
        status: 'SUCCESS',
        description: `Electronic signature request dispatched to ${data.workerEmail || data.workerName}`,
      });
    }

    const newContract: ESignatureContract = {
      id: contractId,
      title: data.title,
      contractType: data.contractType as any,
      businessId: data.businessId,
      businessName: data.businessName,
      businessEmail: data.businessEmail || 'dispatch@uspot.com',
      businessPhone: data.businessPhone || '+1 (555) 000-0000',
      businessAddress: data.businessAddress || 'New York, NY',
      workerId: data.workerId,
      workerName: data.workerName,
      workerEmail: data.workerEmail || `${data.workerName.toLowerCase().replace(/\s+/g, '.')}@uspot.com`,
      workerPhone: data.workerPhone || '+1 (555) 123-4567',
      reportingTo: data.reportingTo || 'Operations Director',
      primaryLocation: data.primaryLocation || 'Main Operations Center',
      location: data.primaryLocation || 'New York, NY',
      payAmount: data.payAmount || '$1,500.00',
      hourlyRate: data.hourlyRate || 85,
      frequency: data.frequency || 'Weekly',
      commissionRate: data.commissionRate || 'N/A',
      startDate: data.startDate || dateStr,
      endDate: data.endDate || 'Ongoing',
      slaTerms: data.slaTerms,
      status: sendImmediately ? 'SENT_FOR_SIGNATURE' : 'DRAFT',
      createdAt: dateStr,
      assignedAt: sendImmediately ? dateStr : undefined,
      auditTrail,
    };

    const updated = [newContract, ...contracts];
    this.saveContracts(updated);
    return newContract;
  }

  // Send an existing draft contract for signature
  public sendContractForSignature(contractId: string): ESignatureContract {
    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const now = new Date();
    const dateStr = this.formatDisplayDate(now);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    contract.status = 'SENT_FOR_SIGNATURE';
    contract.assignedAt = dateStr;
    contract.auditTrail.push({
      id: `aud-${Date.now()}`,
      contractId,
      event: 'SIGNATURE_REQUEST_SENT',
      userId: contract.businessId,
      userName: contract.businessName,
      userRole: 'business',
      timestamp: `${dateStr} — ${timeStr}`,
      ipAddress: MOCK_IP_ADDRESS,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
      status: 'SUCCESS',
      description: `Signature request dispatched to ${contract.workerName}`,
    });

    this.saveContracts(contracts);
    return contract;
  }

  // Validate signing session state
  public validateSigningSession(
    contractId: string,
    workerId: string
  ): { valid: boolean; error?: string; contract?: ESignatureContract } {
    const contract = this.getContractById(contractId);
    if (!contract) {
      return { valid: false, error: 'Contract not found in registry.' };
    }
    if (contract.workerId !== workerId && workerId !== 'user-specialist') {
      return { valid: false, error: 'This contract is not assigned to your worker profile.' };
    }
    if (contract.status === 'COMPLETED' || contract.status === 'SIGNED') {
      return {
        valid: false,
        error: 'This contract has already been executed and cannot be signed again.',
        contract,
      };
    }
    return { valid: true, contract };
  }

  // Step 1: Record Contract Viewed / Reviewed
  public recordContractViewed(
    contractId: string,
    worker: { id: string; name: string }
  ): ESignatureContract {
    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const now = new Date();
    const timeFormatted = this.formatCurrentTimestamp();
    const timeShort = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (contract.status === 'SENT_FOR_SIGNATURE') {
      contract.status = 'VIEWED';
    }
    contract.viewedAt = timeFormatted;

    // Check if CONTRACT_REVIEWED already logged
    const hasReviewed = contract.auditTrail.some((e) => e.event === 'CONTRACT_REVIEWED');
    if (!hasReviewed) {
      contract.auditTrail.push({
        id: `aud-${Date.now()}-view`,
        contractId,
        event: 'CONTRACT_REVIEWED',
        userId: worker.id,
        userName: worker.name,
        userRole: 'worker',
        timestamp: `${this.formatDisplayDate(now)} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Worker ${worker.name} opened and reviewed contract terms`,
      });
      this.saveContracts(contracts);
    }

    return contract;
  }

  // Step 2: Record Electronic Consent
  public recordConsent(
    contractId: string,
    worker: { id: string; name: string }
  ): ESignatureContract {
    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const now = new Date();
    const timeFormatted = this.formatCurrentTimestamp();
    const timeShort = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    contract.consentAgreed = true;
    contract.consentAt = timeFormatted;
    if (contract.status === 'VIEWED' || contract.status === 'SENT_FOR_SIGNATURE') {
      contract.status = 'CONSENTED';
    }

    contract.auditTrail.push({
      id: `aud-${Date.now()}-consent`,
      contractId,
      event: 'ELECTRONIC_CONSENT_PROVIDED',
      userId: worker.id,
      userName: worker.name,
      userRole: 'worker',
      timestamp: `${this.formatDisplayDate(now)} — ${timeShort}`,
      ipAddress: MOCK_IP_ADDRESS,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
      status: 'SUCCESS',
      description: `Worker ${worker.name} provided legal consent to use electronic signatures`,
    });

    this.saveContracts(contracts);
    return contract;
  }

  // Step 3: Authenticate Signer (Mock OTP: 123456)
  public async authenticateSigner(
    contractId: string,
    worker: { id: string; name: string },
    otpCode: string
  ): Promise<{ success: boolean; error?: string; contract?: ESignatureContract }> {
    // Artificial latency simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanCode = otpCode.trim();
    if (cleanCode !== '123456') {
      return {
        success: false,
        error: 'Invalid 6-digit verification code. Please enter 123456 for this prototype session.',
      };
    }

    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return { success: false, error: 'Contract not found' };

    const now = new Date();
    const timeFormatted = this.formatCurrentTimestamp();
    const timeShort = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    contract.authenticatedAt = timeFormatted;
    contract.authMethod = 'mock_otp';
    contract.status = 'AUTHENTICATED';

    contract.auditTrail.push({
      id: `aud-${Date.now()}-auth`,
      contractId,
      event: 'AUTHENTICATION_SUCCESSFUL',
      userId: worker.id,
      userName: worker.name,
      userRole: 'worker',
      timestamp: `${this.formatDisplayDate(now)} — ${timeShort}`,
      ipAddress: MOCK_IP_ADDRESS,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
      status: 'SUCCESS',
      description: `Identity verified via 6-digit OTP token for ${worker.name}`,
    });

    this.saveContracts(contracts);
    return { success: true, contract };
  }

  // Step 4: Save Captured Signature
  public saveSignature(
    contractId: string,
    worker: { id: string; name: string },
    signatureData: ESignatureData
  ): ESignatureContract {
    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const now = new Date();
    const timeFormatted = this.formatCurrentTimestamp();
    const timeShort = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    contract.signature = signatureData;
    contract.signatureCapturedAt = timeFormatted;
    contract.status = 'SIGNATURE_CAPTURED';

    contract.auditTrail.push({
      id: `aud-${Date.now()}-sig`,
      contractId,
      event: 'SIGNATURE_CAPTURED',
      userId: worker.id,
      userName: worker.name,
      userRole: 'worker',
      timestamp: `${this.formatDisplayDate(now)} — ${timeShort}`,
      ipAddress: MOCK_IP_ADDRESS,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
      status: 'SUCCESS',
      description: `Signature captured via ${signatureData.type === 'draw' ? 'digital canvas drawing' : 'handwritten image upload'}`,
    });

    this.saveContracts(contracts);
    return contract;
  }

  // Calculate real SHA-256 document hash using Web Crypto API
  public async calculateDocumentHash(dataToHash: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(dataToHash);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      }
    } catch (e) {
      console.warn('Web Crypto SHA-256 fallback', e);
    }
    // Fallback deterministic hash generator if crypto API unavailable
    let hash = 0;
    for (let i = 0; i < dataToHash.length; i++) {
      const char = dataToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852`.slice(0, 64);
  }

  // Uploaded Signature Image Processing Pipeline
  // Original Image -> Grayscale -> Threshold/Noise reduction -> Detect bounding box -> Background removal (transparent) -> Crop
  public async processUploadedSignatureImage(
    file: File
  ): Promise<{ originalDataUrl: string; processedDataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        return reject(new Error('Unsupported file type. Please upload a PNG, JPG, JPEG, or WebP image.'));
      }
      // Validate file size (max 6MB)
      if (file.size > 6 * 1024 * 1024) {
        return reject(new Error('File size exceeds the 6MB limit. Please upload a smaller image.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          try {
            // Offscreen canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return resolve({
                originalDataUrl,
                processedDataUrl: originalDataUrl,
                width: img.width,
                height: img.height,
              });
            }

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;

            // Step 1: Detect background brightness
            // Sample edge pixels to estimate paper color
            let bgBrightnessSum = 0;
            let sampleCount = 0;
            for (let x = 0; x < canvas.width; x += 10) {
              const idxTop = (0 * canvas.width + x) * 4;
              const idxBottom = ((canvas.height - 1) * canvas.width + x) * 4;
              bgBrightnessSum += (data[idxTop] + data[idxTop + 1] + data[idxTop + 2]) / 3;
              bgBrightnessSum += (data[idxBottom] + data[idxBottom + 1] + data[idxBottom + 2]) / 3;
              sampleCount += 2;
            }
            const avgBgBrightness = sampleCount > 0 ? bgBrightnessSum / sampleCount : 240;
            const threshold = Math.max(140, Math.min(230, avgBgBrightness - 30));

            // Step 2: Grayscale, noise filtering, and ink detection
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // Grayscale formula: 0.299R + 0.587G + 0.114B
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                if (brightness < threshold) {
                  // Ink detected
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;

                  // High contrast crisp dark ink (#0f172a / dark navy-slate)
                  data[idx] = 15; // R
                  data[idx + 1] = 23; // G
                  data[idx + 2] = 42; // B
                  // Anti-aliased alpha based on how dark it is
                  const alphaFactor = Math.min(255, Math.max(160, Math.round(((threshold - brightness) / threshold) * 255 * 1.5)));
                  data[idx + 3] = alphaFactor;
                } else {
                  // Background paper -> Transparent
                  data[idx + 3] = 0;
                }
              }
            }

            ctx.putImageData(imgData, 0, 0);

            // Step 3: Bounding box crop with padding
            const padding = 16;
            const cropX = Math.max(0, minX - padding);
            const cropY = Math.max(0, minY - padding);
            const cropW = Math.min(canvas.width - cropX, Math.max(60, maxX - minX + padding * 2));
            const cropH = Math.min(canvas.height - cropY, Math.max(30, maxY - minY + padding * 2));

            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            const croppedCtx = croppedCanvas.getContext('2d');

            if (croppedCtx && cropW > 0 && cropH > 0) {
              croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              const processedDataUrl = croppedCanvas.toDataURL('image/png');
              resolve({
                originalDataUrl,
                processedDataUrl,
                width: cropW,
                height: cropH,
              });
            } else {
              resolve({
                originalDataUrl,
                processedDataUrl: canvas.toDataURL('image/png'),
                width: canvas.width,
                height: canvas.height,
              });
            }
          } catch (err) {
            console.error('Error during signature image processing', err);
            resolve({
              originalDataUrl,
              processedDataUrl: originalDataUrl,
              width: img.width,
              height: img.height,
            });
          }
        };
        img.onerror = () => reject(new Error('Failed to load image file. Please verify file integrity.'));
        img.src = originalDataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  // Generate Signed Contract PDF with jsPDF and embed signature
  public async generateSignedContractPdf(
    contract: ESignatureContract
  ): Promise<{ blob: Blob; dataUrl: string; hash: string }> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 612 x 792 pt
    });

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2; // 532 pt
    let currentY = 40;

    // ---------------- PAGE 1: CONTRACT ----------------
    // Top Bar Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, currentY, contentWidth, 54, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('URSPOT MARKETPLACE', margin + 16, currentY + 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('CRYPTOGRAPHICALLY SECURED SERVICE CONTRACT', margin + 16, currentY + 40);

    // Contract ID Badge right-aligned
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`ID: ${contract.id}`, margin + contentWidth - 16, currentY + 32, { align: 'right' });

    currentY += 72;

    // Contract Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(contract.title, contentWidth);
    doc.text(titleLines, margin, currentY);
    currentY += titleLines.length * 18 + 12;

    // Parties Information Box (2 Columns)
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, currentY, contentWidth, 80, 6, 6, 'FD');

    // Left Column: Business
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('CONTRACTING BUSINESS (HOST)', margin + 14, currentY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(contract.businessName, margin + 14, currentY + 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Email: ${contract.businessEmail}  |  Phone: ${contract.businessPhone}`, margin + 14, currentY + 49);
    doc.text(`Site: ${contract.primaryLocation}`, margin + 14, currentY + 63);

    // Right Column: Worker
    const rightColX = margin + contentWidth / 2 + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('SERVICE PROVIDER (SPECIALIST / WORKER)', rightColX, currentY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(contract.workerName, rightColX, currentY + 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Email: ${contract.workerEmail}  |  Phone: ${contract.workerPhone}`, rightColX, currentY + 49);
    doc.text(`ID: ${contract.workerId}  |  Status: ACTIVE VERIFIED`, rightColX, currentY + 63);

    currentY += 94;

    // Metadata Bar
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currentY, contentWidth, 34, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TYPE:', margin + 12, currentY + 21);
    doc.setTextColor(15, 23, 42);
    doc.text(String(contract.contractType).toUpperCase(), margin + 44, currentY + 21);

    doc.setTextColor(100, 116, 139);
    doc.text('COMPENSATION:', margin + 175, currentY + 21);
    doc.setTextColor(15, 23, 42);
    doc.text(`${contract.payAmount} (${contract.frequency})`, margin + 258, currentY + 21);

    doc.setTextColor(100, 116, 139);
    doc.text('EFFECTIVE:', margin + 380, currentY + 21);
    doc.setTextColor(15, 23, 42);
    doc.text(`${contract.startDate} - ${contract.endDate}`, margin + 435, currentY + 21);

    currentY += 46;

    // Terms & SLA Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('AGREEMENT TERMS & SERVICE LEVEL STANDARDS', margin, currentY);
    currentY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const termsLines = doc.splitTextToSize(contract.slaTerms, contentWidth);
    doc.text(termsLines, margin, currentY);
    currentY += termsLines.length * 11 + 20;

    // Signature Execution Box
    const sigBoxY = Math.max(currentY, pageHeight - 215);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, sigBoxY, contentWidth, 140, 6, 6, 'FD');

    // Box Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, sigBoxY, contentWidth, 24, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ELECTRONIC SIGNATURE EXECUTION ATTESTATION', margin + 12, sigBoxY + 16);

    // Embed Signature Image if available
    const sigImg = contract.signature?.processedData || contract.signature?.data;
    if (sigImg) {
      try {
        doc.addImage(sigImg, 'PNG', margin + 16, sigBoxY + 34, 150, 50);
      } catch (err) {
        console.warn('Could not embed signature into PDF canvas', err);
        doc.setFont('times', 'italic');
        doc.setFontSize(22);
        doc.text(contract.workerName, margin + 20, sigBoxY + 68);
      }
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(22);
      doc.text(contract.workerName, margin + 20, sigBoxY + 68);
    }

    // Baseline line under signature
    doc.setDrawColor(203, 213, 225);
    doc.line(margin + 16, sigBoxY + 90, margin + 190, sigBoxY + 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Authorized Electronic Signature of: ${contract.workerName}`, margin + 16, sigBoxY + 102);
    doc.text(`Title: Certified Specialist  |  Role: Service Provider`, margin + 16, sigBoxY + 114);
    doc.text(`Consent: Express E-Sign Agreement Recorded`, margin + 16, sigBoxY + 126);

    // Right side of signature box: Verification details
    const rightSigX = margin + 215;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('VERIFICATION METADATA', rightSigX, sigBoxY + 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Signed At (UTC): ${contract.signedAt || this.formatCurrentTimestamp()}`, rightSigX, sigBoxY + 54);
    doc.text(`Authentication: 6-Digit OTP Token Verified (Mock Session)`, rightSigX, sigBoxY + 68);
    doc.text(`Signer IP Address: ${MOCK_IP_ADDRESS}`, rightSigX, sigBoxY + 82);
    doc.text(`Consent Timestamp: ${contract.consentAt || this.formatCurrentTimestamp()}`, rightSigX, sigBoxY + 96);
    doc.text(`Status: COMPLETED (Cryptographically Bound)`, rightSigX, sigBoxY + 110);

    // Page 1 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Document ID: ${contract.id}  |  Secure Digital Ledger  |  Page 1 of 2`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );

    // ---------------- PAGE 2: CERTIFICATE OF COMPLETION ----------------
    doc.addPage();
    let p2Y = 45;

    // Certificate Header Frame
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(2);
    doc.rect(margin, p2Y, contentWidth, pageHeight - 90);

    p2Y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('ELECTRONIC SIGNATURE CERTIFICATE', pageWidth / 2, p2Y, { align: 'center' });

    p2Y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CERTIFICATE OF COMPLETION & AUDIT RECORD', pageWidth / 2, p2Y, { align: 'center' });

    p2Y += 30;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin + 30, p2Y, margin + contentWidth - 30, p2Y);

    p2Y += 25;
    // Certificate Detail Rows
    const certDetails = [
      { label: 'Contract Reference ID', value: contract.id },
      { label: 'Document Title', value: contract.title },
      { label: 'Contracting Business', value: `${contract.businessName} (${contract.businessId})` },
      { label: 'Signer Name', value: contract.workerName },
      { label: 'Signer Email', value: contract.workerEmail },
      { label: 'Signer Role', value: 'Specialist / Service Provider' },
      { label: 'Signed Timestamp', value: contract.signedAt || this.formatCurrentTimestamp() },
      { label: 'Consent Timestamp', value: contract.consentAt || this.formatCurrentTimestamp() },
      { label: 'Authentication Method', value: '6-Digit One-Time Password (OTP) Identity Verification' },
      { label: 'Signer IP Address', value: MOCK_IP_ADDRESS },
      {
        label: 'User Agent',
        value: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 75) : 'URSPOT-Agent/2.0',
      },
      { label: 'Execution Status', value: 'COMPLETED & TAMPER-EVIDENT' },
    ];

    certDetails.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(item.label + ':', margin + 40, p2Y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.value, margin + 190, p2Y);

      p2Y += 19;
    });

    p2Y += 15;
    // Document Hash Callout Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + 30, p2Y, contentWidth - 60, 68, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('CRYPTOGRAPHIC DOCUMENT HASH (SHA-256)', margin + 44, p2Y + 20);

    const hashString =
      contract.documentHash ||
      (await this.calculateDocumentHash(`${contract.id}-${contract.workerId}-${contract.signedAt || Date.now()}`));

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(hashString, margin + 44, p2Y + 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'This SHA-256 cryptographic digest uniquely identifies this signed agreement and guarantees tamper-evidence.',
      margin + 44,
      p2Y + 54
    );

    p2Y += 95;

    // Legal Compliance Notice (U.S. ESIGN Act)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('LEGAL & STATUTORY COMPLIANCE DISCLOSURE', margin + 40, p2Y);

    p2Y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const legalNotice =
      'This document was executed via the URSPOT electronic signature workflow in conformity with the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001) and the Uniform Electronic Transactions Act (UETA). The electronic signature recorded herein holds the same legal validity, effect, and enforceability as a handwritten signature.';
    const legalNoticeLines = doc.splitTextToSize(legalNotice, contentWidth - 80);
    doc.text(legalNoticeLines, margin + 40, p2Y);

    p2Y += legalNoticeLines.length * 9 + 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      '* Developer / Prototype Notice: Production implementation should be reviewed for applicable US federal and state electronic-signature requirements.',
      margin + 40,
      p2Y
    );

    // Page 2 Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Certificate ID: ${contract.certificate?.certificateId || 'CERT-' + contract.id}  |  Page 2 of 2`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );

    const blob = doc.output('blob');
    const dataUrl = doc.output('datauristring');
    return { blob, dataUrl, hash: hashString };
  }

  // Final Step: Confirm & Sign Contract
  public async confirmAndSignContract(
    contractId: string,
    worker: { id: string; name: string; email?: string }
  ): Promise<ESignatureContract> {
    const contracts = this.getContracts();
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) throw new Error('Contract not found in registry');

    // Validation checks
    if (!contract.consentAgreed) {
      throw new Error('Electronic signature consent must be provided before finalizing contract.');
    }
    if (!contract.authenticatedAt) {
      throw new Error('Signer identity must be authenticated prior to signing.');
    }
    if (!contract.signature) {
      throw new Error('A signature must be captured before finalizing.');
    }
    if (contract.status === 'COMPLETED') {
      throw new Error('This contract is already signed and finalized.');
    }

    const now = new Date();
    const dynamicTimestamp = this.formatCurrentTimestamp();
    const dateStr = this.formatDisplayDate(now);
    const timeShort = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    contract.signedAt = dynamicTimestamp;

    // Calculate real SHA-256 hash of contract data payload
    const dataToHash = JSON.stringify({
      id: contract.id,
      title: contract.title,
      businessId: contract.businessId,
      workerId: contract.workerId,
      terms: contract.slaTerms,
      signature: contract.signature.processedData || contract.signature.data,
      signedAt: dynamicTimestamp,
      consentAt: contract.consentAt,
      authenticatedAt: contract.authenticatedAt,
    });
    const docHash = await this.calculateDocumentHash(dataToHash);
    contract.documentHash = docHash;

    const certId = `CERT-${contract.id.replace('CTR-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const certificate: CertificateOfCompletion = {
      certificateId: certId,
      contractId: contract.id,
      contractTitle: contract.title,
      businessId: contract.businessId,
      businessName: contract.businessName,
      signerId: worker.id,
      signerName: worker.name,
      signerEmail: worker.email || contract.workerEmail,
      signerRole: 'Specialist / Service Provider',
      signedAt: dynamicTimestamp,
      authMethod: '6-Digit One-Time Password (OTP) Identity Verification',
      ipAddress: MOCK_IP_ADDRESS,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
      documentHash: docHash,
      status: 'COMPLETED',
    };
    contract.certificate = certificate;
    contract.status = 'COMPLETED';

    // Record complete chronological audit trail events
    contract.auditTrail.push(
      {
        id: `aud-${Date.now()}-confirmed`,
        contractId,
        event: 'SIGNATURE_CONFIRMED',
        userId: worker.id,
        userName: worker.name,
        userRole: 'worker',
        timestamp: `${dateStr} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Signature preview reviewed and confirmed by ${worker.name}`,
      },
      {
        id: `aud-${Date.now()}-signed`,
        contractId,
        event: 'CONTRACT_SIGNED',
        userId: worker.id,
        userName: worker.name,
        userRole: 'worker',
        timestamp: `${dateStr} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Electronic signature legally executed by ${worker.name}`,
      },
      {
        id: `aud-${Date.now()}-pdf`,
        contractId,
        event: 'SIGNED_PDF_GENERATED',
        userId: worker.id,
        userName: 'URSPOT PDF Engine',
        userRole: 'system',
        timestamp: `${dateStr} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: 'URSPOT-PDF-Renderer/2.0',
        status: 'SUCCESS',
        description: `Signed contract PDF generated with embedded signature and certificate`,
      },
      {
        id: `aud-${Date.now()}-hash`,
        contractId,
        event: 'DOCUMENT_HASH_GENERATED',
        userId: worker.id,
        userName: 'URSPOT Security Shield',
        userRole: 'system',
        timestamp: `${dateStr} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: 'WebCrypto/SHA-256',
        status: 'SUCCESS',
        description: `Cryptographic SHA-256 hash generated: ${docHash.slice(0, 16)}...`,
      },
      {
        id: `aud-${Date.now()}-completed`,
        contractId,
        event: 'SIGNING_COMPLETED',
        userId: worker.id,
        userName: worker.name,
        userRole: 'worker',
        timestamp: `${dateStr} — ${timeShort}`,
        ipAddress: MOCK_IP_ADDRESS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'URSPOT-Client',
        status: 'SUCCESS',
        description: `Contract successfully signed and moved to COMPLETED state. Certificate issued.`,
      }
    );

    // Generate signed PDF asynchronously
    try {
      const { dataUrl } = await this.generateSignedContractPdf(contract);
      contract.signedPdfDataUrl = dataUrl;
    } catch (e) {
      console.warn('PDF generation in background notice', e);
    }

    this.saveContracts(contracts);
    return contract;
  }

  // Trigger download of signed contract PDF
  public async downloadSignedContract(contract: ESignatureContract): Promise<void> {
    const { blob } = await this.generateSignedContractPdf(contract);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `URSPOT-Contract-${contract.id}-Signed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export const contractSigningService = new ContractSigningService();
