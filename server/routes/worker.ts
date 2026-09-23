import { Router } from 'express';
import { db } from '../db';
import {
  users,
  workerJobs,
  workerContracts,
  workerTransactions,
  workerBusinessSchedules,
  businesses,
} from '../db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';

const router = Router();

// Helper to parse '09:00 AM' or '14:30' into minutes from midnight
function parseTimeToMinutes(tStr: string): number {
  if (!tStr) return 0;
  const cleaned = tStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const timePart = cleaned.replace(/AM|PM/g, '').trim();
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// Helper to seed worker demo schedules if empty
export async function ensureWorkerDemoSchedule(workerId: string) {
  try {
    const existing = await db
      .select()
      .from(workerBusinessSchedules)
      .where(eq(workerBusinessSchedules.workerId, workerId));

    if (existing.length === 0) {
      // Demo schedule for Morgan Blake matching user requirement:
      // Mon: 9 AM - 12 PM Biz A (Glow Salon), 2 PM - 6 PM Biz B (Onyx Spa)
      // Tue: 9 AM - 1 PM Biz A, 3 PM - 7 PM Biz B
      // Wed: 10 AM - 2 PM Biz A, 3 PM - 6 PM Biz B
      // Thu: 9 AM - 12 PM Biz A, 1 PM - 5 PM Biz B
      // Fri: 9 AM - 1 PM Biz A, 2 PM - 6 PM Biz B
      // Sat: 10 AM - 4 PM Biz A
      const demoSlots = [
        // Monday (1)
        {
          id: `sch-${workerId}-mon-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 1,
          dayName: 'Monday',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          isAvailable: true,
          hourlyRate: '85.00',
          notes: 'Morning salon shift: Hair cutting, styling & coloring',
        },
        {
          id: `sch-${workerId}-mon-2`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          dayOfWeek: 1,
          dayName: 'Monday',
          startTime: '02:00 PM',
          endTime: '06:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Afternoon spa shift: Wellness treatments & hydrotherapy',
        },
        // Tuesday (2)
        {
          id: `sch-${workerId}-tue-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 2,
          dayName: 'Tuesday',
          startTime: '09:00 AM',
          endTime: '01:00 PM',
          isAvailable: true,
          hourlyRate: '85.00',
          notes: 'Morning shift at Glow Salon',
        },
        {
          id: `sch-${workerId}-tue-2`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          dayOfWeek: 2,
          dayName: 'Tuesday',
          startTime: '03:00 PM',
          endTime: '07:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Evening wellness shifts at Onyx Spa',
        },
        // Wednesday (3)
        {
          id: `sch-${workerId}-wed-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 3,
          dayName: 'Wednesday',
          startTime: '10:00 AM',
          endTime: '02:00 PM',
          isAvailable: true,
          hourlyRate: '85.00',
          notes: 'Mid-day salon shift',
        },
        {
          id: `sch-${workerId}-wed-2`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          dayOfWeek: 3,
          dayName: 'Wednesday',
          startTime: '03:00 PM',
          endTime: '06:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Spa sauna calibration & specialist service',
        },
        // Thursday (4)
        {
          id: `sch-${workerId}-thu-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 4,
          dayName: 'Thursday',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          isAvailable: true,
          hourlyRate: '85.00',
          notes: 'Morning salon appointments',
        },
        {
          id: `sch-${workerId}-thu-2`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          dayOfWeek: 4,
          dayName: 'Thursday',
          startTime: '01:00 PM',
          endTime: '05:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Afternoon luxury massage & facilities operations',
        },
        // Friday (5)
        {
          id: `sch-${workerId}-fri-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 5,
          dayName: 'Friday',
          startTime: '09:00 AM',
          endTime: '01:00 PM',
          isAvailable: true,
          hourlyRate: '85.00',
          notes: 'Peak Friday salon styling',
        },
        {
          id: `sch-${workerId}-fri-2`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          dayOfWeek: 5,
          dayName: 'Friday',
          startTime: '02:00 PM',
          endTime: '06:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Peak Friday spa wellness shifts',
        },
        // Saturday (6)
        {
          id: `sch-${workerId}-sat-1`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          dayOfWeek: 6,
          dayName: 'Saturday',
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          isAvailable: true,
          hourlyRate: '95.00',
          notes: 'Weekend prime salon specialist hours',
        },
      ];

      await db.insert(workerBusinessSchedules).values(demoSlots);
    }
  } catch (err) {
    console.error('ensureWorkerDemoSchedule error:', err);
  }
}

// Helper to seed worker demo jobs if empty
export async function ensureWorkerDemoData(workerId: string) {
  try {
    await ensureWorkerDemoSchedule(workerId);

    const existingJobs = await db
      .select()
      .from(workerJobs)
      .where(eq(workerJobs.workerId, workerId));

    if (existingJobs.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      // Insert Demo Jobs
      await db.insert(workerJobs).values([
        {
          id: `job-wrk-101`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          title: 'Master Color Correction & Highlights',
          serviceCategory: 'Hair & Styling',
          customerName: 'Sarah Jenkins',
          customerPhone: '+1 (555) 432-8899',
          customerEmail: 'sarah.j@example.com',
          location: '742 Evergreen Terrace, Suite 104, New York, NY 10001',
          scheduledDate: todayStr,
          scheduledStartTime: '10:00 AM',
          scheduledEndTime: '12:30 PM',
          durationMinutes: 150,
          status: 'in_progress',
          rate: '145.00',
          tip: '25.00',
          totalPayout: '170.00',
          notes: 'Customer requested ammonia-free organic toner. Patch test verified.',
          checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
          checkInNotes: 'Arrived on time. Workstation sanitized and colors formulated.',
        },
        {
          id: `job-wrk-102`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          title: 'Keratin Smoothing Complex Treatment',
          serviceCategory: 'Hair Treatment',
          customerName: 'Elena Rostova',
          customerPhone: '+1 (555) 901-2244',
          customerEmail: 'elena.r@example.com',
          location: '742 Evergreen Terrace, Station 3, New York, NY 10001',
          scheduledDate: todayStr,
          scheduledStartTime: '02:00 PM',
          scheduledEndTime: '04:00 PM',
          durationMinutes: 120,
          status: 'scheduled',
          rate: '180.00',
          tip: '0.00',
          totalPayout: '180.00',
          notes: 'Pre-washed hair. Bring thermal protector serum.',
        },
        {
          id: `job-wrk-103`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          title: 'Full HVAC Air Quality & Filter Replacement',
          serviceCategory: 'Facilities & Maintenance',
          customerName: 'Onyx Operations Dept',
          customerPhone: '+1 (555) 345-6789',
          customerEmail: 'devon.lane@example.com',
          location: '88 Hudson Yards, Floor 4, New York, NY 10001',
          scheduledDate: tomorrow,
          scheduledStartTime: '09:00 AM',
          scheduledEndTime: '11:30 AM',
          durationMinutes: 150,
          status: 'scheduled',
          rate: '210.00',
          tip: '0.00',
          totalPayout: '210.00',
          notes: 'Routine quarterly HEPA filter replacement across 6 treatment suites.',
        },
        {
          id: `job-wrk-104`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          title: 'Hydrotherapy Sauna Calibration & Electrical Check',
          serviceCategory: 'Electrical & Plumbing',
          customerName: 'Marcus Vance',
          customerPhone: '+1 (555) 678-1122',
          customerEmail: 'marcus.vance@onyxspa.com',
          location: '88 Hudson Yards, Thermal Suite B, New York, NY 10001',
          scheduledDate: yesterday,
          scheduledStartTime: '11:00 AM',
          scheduledEndTime: '01:00 PM',
          durationMinutes: 120,
          status: 'completed',
          rate: '195.00',
          tip: '30.00',
          totalPayout: '225.00',
          notes: 'Pressure regulator calibrated. Replaced thermal sensor probe.',
          checkInTime: new Date(Date.now() - 90000000),
          checkOutTime: new Date(Date.now() - 82800000),
          customerSignOffName: 'Marcus Vance',
          signature: 'M. Vance (Verified Facilities Director)',
          rating: 5,
          feedback: 'Outstanding technical precision. Sauna operating at peak efficiency.',
        },
        {
          id: `job-wrk-105`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          title: 'Emergency Drainage Clear & Fixture Repair',
          serviceCategory: 'Plumbing & Emergency',
          customerName: 'Alex Vance',
          customerPhone: '+1 (555) 234-5678',
          customerEmail: 'alex.vance@uspot.com',
          location: '742 Evergreen Terrace, Wash Station 1-4, New York, NY 10001',
          scheduledDate: twoDaysAgo,
          scheduledStartTime: '08:30 AM',
          scheduledEndTime: '10:30 AM',
          durationMinutes: 120,
          status: 'completed',
          rate: '160.00',
          tip: '20.00',
          totalPayout: '180.00',
          notes: 'Cleared main trap blockage. Restored full water flow.',
          checkInTime: new Date(Date.now() - 176400000),
          checkOutTime: new Date(Date.now() - 169200000),
          customerSignOffName: 'Alex Vance',
          signature: 'Alex Vance (Store Owner)',
          rating: 5,
          feedback: 'Rescued our morning appointments! Quick response time.',
        },
      ]);

      // Insert Demo Contracts
      await db.insert(workerContracts).values([
        {
          id: `ctr-wrk-201`,
          workerId,
          businessId: 'biz-salon-01',
          businessName: 'Glow Salon & Hair Studio',
          title: 'Master Stylist & Facilities Specialist On-Demand Agreement',
          contractType: 'independent_contractor',
          status: 'active',
          hourlyRate: '85.00',
          commissionPercentage: '75.00',
          startDate: '2026-01-15',
          endDate: '2026-12-31',
          terms:
            'Contractor agrees to provide specialized cosmetic, electrical, and facility services for Glow Salon & Hair Studio. Payment is disbursed via UrSpot Direct Deposit bi-weekly.',
          signedAt: new Date('2026-01-15T14:30:00Z'),
          signature: 'Morgan Blake (Authorized Contractor)',
        },
        {
          id: `ctr-wrk-202`,
          workerId,
          businessId: 'biz-spa-02',
          businessName: 'Onyx Luxury Spa & Wellness',
          title: 'Senior Technical Infrastructure & Specialist Service Retainer',
          contractType: 'master_service_agreement',
          status: 'active',
          hourlyRate: '95.00',
          commissionPercentage: '80.00',
          startDate: '2026-03-01',
          endDate: '2027-02-28',
          terms:
            'Dedicated high-tier infrastructure maintenance and certified specialist operations for wellness facilities. Guaranteed minimum 10 hours monthly allocation.',
          signedAt: new Date('2026-03-01T09:00:00Z'),
          signature: 'Morgan Blake (Authorized Specialist)',
        },
      ]);

      // Insert Demo Transactions
      await db.insert(workerTransactions).values([
        {
          id: `tx-wrk-301`,
          workerId,
          jobId: 'job-wrk-104',
          type: 'job_payout',
          amount: '225.00',
          status: 'completed',
          description: 'Payout for Hydrotherapy Sauna Calibration & Electrical Check',
          referenceNumber: 'WRK-PAY-882194',
          payoutMethod: 'Direct Deposit (ACH)',
          date: yesterday,
        },
        {
          id: `tx-wrk-302`,
          workerId,
          jobId: 'job-wrk-105',
          type: 'job_payout',
          amount: '180.00',
          status: 'completed',
          description: 'Payout for Emergency Drainage Clear & Fixture Repair',
          referenceNumber: 'WRK-PAY-881903',
          payoutMethod: 'Direct Deposit (ACH)',
          date: twoDaysAgo,
        },
        {
          id: `tx-wrk-303`,
          workerId,
          type: 'bonus',
          amount: '75.00',
          status: 'completed',
          description: 'Monthly 5-Star Customer Satisfaction Rating Bonus',
          referenceNumber: 'WRK-BONUS-99120',
          payoutMethod: 'UrSpot Platform Bonus',
          date: '2026-09-15',
        },
        {
          id: `tx-wrk-304`,
          workerId,
          type: 'direct_deposit',
          amount: '680.00',
          status: 'completed',
          description: 'Bi-Weekly Direct Deposit Payout to Chase Premier Business (•••• 7712)',
          referenceNumber: 'ACH-TRANSFER-449102',
          payoutMethod: 'Chase Premier Business (•••• 7712)',
          date: '2026-09-10',
        },
      ]);
    }
  } catch (err) {
    console.error('ensureWorkerDemoData error:', err);
  }
}

// Helper to ensure at least one default certified specialist/worker exists in DB
export async function ensureDefaultWorkerUser() {
  try {
    const allUsers = await db.select().from(users);
    const hasWorker = allUsers.some((u) => u.role === 'worker' || u.role === 'specialist');
    if (!hasWorker) {
      const defaultWorker = {
        id: 'user-specialist',
        role: 'worker',
        roleLabel: 'Worker',
        status: 'active',
        email: 'morgan.blake@uspot.com',
        username: 'morgan_worker',
        phone: '+1 (555) 876-5432',
        nickname: 'Morgan',
        fullName: 'Morgan Blake',
        referralCode: 'USPOT-WRK42',
        emailVerified: true,
        phoneVerified: true,
        timezone: 'America/New_York',
        avatarInitials: 'MB',
        department: 'On-site Specialist & Field Operations',
        primaryServiceCategory: 'hvac, electrical, carpentry, cleaning, painting, landscaping, moving, plumbing',
        yearsOfExperience: '10',
        memberSince: 'Aug 18, 2026',
      };
      await db.insert(users).values(defaultWorker).onConflictDoNothing();
      await ensureWorkerDemoData('user-specialist');
      await ensureWorkerDemoSchedule('user-specialist');
      return true;
    }
    return false;
  } catch (err) {
    console.error('ensureDefaultWorkerUser error:', err);
    return false;
  }
}

// 0. Worker Auth: Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const term = (identifier || email || username || '').trim().toLowerCase();

    const allUsers = await db.select().from(users);
    let worker = allUsers.find(
      (u) =>
        (u.role === 'worker' || u.role === 'specialist') &&
        (u.email?.toLowerCase() === term ||
          u.username?.toLowerCase() === term ||
          u.id.toLowerCase() === term)
    );

    // Fallback: If no term provided or matching first worker
    if (!worker) {
      worker = allUsers.find((u) => u.role === 'worker' || u.role === 'specialist');
    }

    if (!worker) {
      // Auto-provision Morgan Blake if DB has zero workers
      await ensureDefaultWorkerUser();
      const reloadedUsers = await db.select().from(users);
      worker = reloadedUsers.find(
        (u) =>
          (u.role === 'worker' || u.role === 'specialist') &&
          (!term ||
            u.email?.toLowerCase() === term ||
            u.username?.toLowerCase() === term ||
            u.id.toLowerCase() === term)
      ) || reloadedUsers.find((u) => u.role === 'worker' || u.role === 'specialist');
    }

    if (!worker) {
      return res.status(404).json({ error: 'Worker account not found.' });
    }

    // Ensure seed jobs exist for this worker
    await ensureWorkerDemoData(worker.id);

    res.json({
      success: true,
      worker: {
        ...worker,
        role: 'worker',
        roleLabel: 'Worker',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Worker Auth: Onboarding & Signup
router.post('/onboarding', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      primaryServiceCategory,
      yearsOfExperience,
      hourlyRate,
      payoutBankName,
      payoutRoutingNumber,
      payoutAccountNumber,
      skills,
    } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and Full Name are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, trimmedEmail));

    const maskedAccount = payoutAccountNumber
      ? `•••• ${payoutAccountNumber.slice(-4)}`
      : '•••• 7712';

    let workerId = `user-worker-${Date.now()}`;
    let savedWorker: any;

    if (existing.length > 0) {
      workerId = existing[0].id;
      const [updated] = await db
        .update(users)
        .set({
          fullName,
          phone: phone || existing[0].phone,
          role: 'worker',
          roleLabel: 'Worker',
          primaryServiceCategory: primaryServiceCategory || existing[0].primaryServiceCategory,
          yearsOfExperience: yearsOfExperience ? String(yearsOfExperience) : existing[0].yearsOfExperience,
          updatedAt: new Date(),
        })
        .where(eq(users.id, workerId))
        .returning();
      savedWorker = updated;
    } else {
      const initials = fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const [created] = await db
        .insert(users)
        .values({
          id: workerId,
          role: 'worker',
          roleLabel: 'Worker',
          status: 'active',
          email: trimmedEmail,
          username: trimmedEmail.split('@')[0],
          fullName,
          phone: phone || '+1 (555) 000-0000',
          avatarInitials: initials,
          referralCode: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
          emailVerified: true,
          phoneVerified: true,
          department: 'Field Operations & Service Specialist',
          primaryServiceCategory: primaryServiceCategory || 'General Maintenance & Services',
          yearsOfExperience: yearsOfExperience ? String(yearsOfExperience) : '5',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })
        .returning();
      savedWorker = created;
    }

    // Populate default demo data for new worker
    await ensureWorkerDemoData(workerId);

    res.json({
      success: true,
      worker: {
        ...savedWorker,
        hourlyRate: hourlyRate || 85,
        rating: 4.95,
        payoutBankName: payoutBankName || 'Chase Bank',
        payoutAccountMasked: maskedAccount,
        payoutRoutingNumber: payoutRoutingNumber || '021000021',
        skills: skills || ['Certified Specialist', 'Safety Verified'],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// BUSINESS-SIDE DISPATCH: CHECK WORKER AVAILABILITY ACROSS BUSINESSES
// ============================================================================
router.get('/businesses/:businessId/available-workers', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { date, time, startTime, endTime, timeSlot } = req.query as {
      date?: string;
      time?: string;
      startTime?: string;
      endTime?: string;
      timeSlot?: string;
    };

    // 1. Resolve business to get standard ID and business name
    const allBusinesses = await db.select().from(businesses);
    const matchedBiz = allBusinesses.find(
      (b) =>
        b.id === businessId ||
        (b.id === 'biz-001' && businessId === 'biz-salon-01') ||
        (b.id === 'biz-salon-01' && businessId === 'biz-001') ||
        (b.id === 'biz-002' && businessId === 'biz-spa-02') ||
        (b.id === 'biz-spa-02' && businessId === 'biz-002') ||
        b.businessName.toLowerCase() === businessId.toLowerCase()
    );

    const targetBizId = matchedBiz?.id || businessId;
    const targetBizName = matchedBiz?.businessName || (businessId.includes('spa') ? 'Onyx Luxury Spa & Wellness' : 'Glow Salon & Hair Studio');

    // 2. Parse target date and day of week
    const targetDateStr = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];
    const dateObj = new Date(targetDateStr + 'T12:00:00Z');
    const dayOfWeek = isNaN(dateObj.getDay()) ? new Date().getDay() : dateObj.getDay();
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = DAY_NAMES[dayOfWeek];

    // 3. Parse requested time range in minutes
    let reqStartMinutes = 9 * 60; // default 09:00 AM
    let reqEndMinutes = 12 * 60;  // default 12:00 PM

    if (startTime && endTime) {
      reqStartMinutes = parseTimeToMinutes(String(startTime));
      reqEndMinutes = parseTimeToMinutes(String(endTime));
    } else if (timeSlot && String(timeSlot).includes('-')) {
      const [s, e] = String(timeSlot).split('-');
      reqStartMinutes = parseTimeToMinutes(s.trim());
      reqEndMinutes = parseTimeToMinutes(e.trim());
    } else if (time) {
      reqStartMinutes = parseTimeToMinutes(String(time));
      reqEndMinutes = reqStartMinutes + 60;
    }

    // 4. Find all workers
    let allUsers = await db.select().from(users);
    let workerUsers = allUsers.filter((u) => u.role === 'worker' || u.role === 'specialist');
    if (workerUsers.length === 0) {
      await ensureDefaultWorkerUser();
      allUsers = await db.select().from(users);
      workerUsers = allUsers.filter((u) => u.role === 'worker' || u.role === 'specialist');
    }
    const allContracts = await db.select().from(workerContracts);

    const results = [];

    for (const worker of workerUsers) {
      // Ensure seed data and schedule exists for this worker
      await ensureWorkerDemoData(worker.id);
      await ensureWorkerDemoSchedule(worker.id);

      // Check worker contract with this business
      const workerContract = allContracts.find(
        (c) =>
          c.workerId === worker.id &&
          (c.businessId === targetBizId ||
            c.businessId === businessId ||
            c.businessName.toLowerCase() === targetBizName.toLowerCase() ||
            (targetBizId.includes('salon') && c.businessName.toLowerCase().includes('salon')) ||
            (targetBizId.includes('spa') && c.businessName.toLowerCase().includes('spa')))
      ) || {
        id: `ctr-${worker.id}-default`,
        workerId: worker.id,
        businessId: targetBizId,
        businessName: targetBizName,
        title: 'Master Specialist & Certified Operator',
        hourlyRate: '85.00',
        status: 'active',
        contractType: 'independent_contractor',
      };

      // Fetch all schedule blocks for this worker on this day of week
      const daySchedules = await db
        .select()
        .from(workerBusinessSchedules)
        .where(
          and(
            eq(workerBusinessSchedules.workerId, worker.id),
            eq(workerBusinessSchedules.dayOfWeek, dayOfWeek),
            eq(workerBusinessSchedules.isAvailable, true)
          )
        );

      // Fetch any existing jobs assigned to this worker on this scheduled date
      const dayJobs = await db
        .select()
        .from(workerJobs)
        .where(
          and(
            eq(workerJobs.workerId, worker.id),
            eq(workerJobs.scheduledDate, targetDateStr)
          )
        );

      // Check if scheduled for THIS business during requested time
      const thisBizSlot = daySchedules.find((slot) => {
        const isSameBiz =
          slot.businessId === targetBizId ||
          slot.businessId === businessId ||
          slot.businessName.toLowerCase() === targetBizName.toLowerCase() ||
          (targetBizId.includes('salon') && slot.businessName.toLowerCase().includes('salon')) ||
          (targetBizId.includes('spa') && slot.businessName.toLowerCase().includes('spa'));

        if (!isSameBiz) return false;

        const slotStart = parseTimeToMinutes(slot.startTime);
        const slotEnd = parseTimeToMinutes(slot.endTime);
        return Math.max(slotStart, reqStartMinutes) < Math.min(slotEnd, reqEndMinutes);
      });

      // Check if scheduled for a DIFFERENT business during this time
      const otherBizSlot = daySchedules.find((slot) => {
        const isSameBiz =
          slot.businessId === targetBizId ||
          slot.businessId === businessId ||
          slot.businessName.toLowerCase() === targetBizName.toLowerCase() ||
          (targetBizId.includes('salon') && slot.businessName.toLowerCase().includes('salon')) ||
          (targetBizId.includes('spa') && slot.businessName.toLowerCase().includes('spa'));

        if (isSameBiz) return false;

        const slotStart = parseTimeToMinutes(slot.startTime);
        const slotEnd = parseTimeToMinutes(slot.endTime);
        return Math.max(slotStart, reqStartMinutes) < Math.min(slotEnd, reqEndMinutes);
      });

      // Check for overlapping jobs already scheduled
      const conflictingJob = dayJobs.find((j) => {
        if (j.status === 'cancelled') return false;
        const jobStart = parseTimeToMinutes(j.scheduledStartTime);
        const jobEnd = parseTimeToMinutes(j.scheduledEndTime);
        return Math.max(jobStart, reqStartMinutes) < Math.min(jobEnd, reqEndMinutes);
      });

      let availabilityStatus: 'available' | 'busy_other_business' | 'busy_job' | 'off_duty' = 'off_duty';
      let availabilityMessage = `Off-duty / Not scheduled on ${targetDayName}.`;

      if (thisBizSlot) {
        if (conflictingJob) {
          availabilityStatus = 'busy_job';
          availabilityMessage = `Scheduled for ${targetBizName} but has an active job (${conflictingJob.title}) from ${conflictingJob.scheduledStartTime} to ${conflictingJob.scheduledEndTime}.`;
        } else {
          availabilityStatus = 'available';
          availabilityMessage = `Available on ${targetDayName} (${thisBizSlot.startTime} - ${thisBizSlot.endTime}) for ${targetBizName}.`;
        }
      } else if (otherBizSlot) {
        availabilityStatus = 'busy_other_business';
        availabilityMessage = `Working at ${otherBizSlot.businessName} (${otherBizSlot.startTime} - ${otherBizSlot.endTime}) on ${targetDayName}.`;
      } else if (daySchedules.length > 0) {
        const scheduleTimes = daySchedules.map((s) => `${s.businessName}: ${s.startTime}-${s.endTime}`).join('; ');
        availabilityStatus = 'off_duty';
        availabilityMessage = `Shift hours on ${targetDayName} do not match requested time. Scheduled: ${scheduleTimes}.`;
      }

      results.push({
        worker: {
          id: worker.id,
          fullName: worker.fullName,
          email: worker.email,
          phone: worker.phone,
          avatar: (worker as any).avatar || (worker as any).avatarUrl || worker.avatarInitials,
          role: 'worker',
        },
        contract: workerContract,
        availabilityStatus,
        availabilityMessage,
        matchedScheduleSlot: thisBizSlot || null,
        conflictingBusinessName: otherBizSlot ? otherBizSlot.businessName : undefined,
        conflictingJob: conflictingJob || null,
        assignedJobsCountToday: dayJobs.length,
        daySchedules,
      });
    }

    res.json({
      success: true,
      businessId: targetBizId,
      businessName: targetBizName,
      date: targetDateStr,
      dayName: targetDayName,
      dayOfWeek,
      requestedTimeWindow: {
        startTime: startTime || (timeSlot ? String(timeSlot).split('-')[0].trim() : '09:00 AM'),
        endTime: endTime || (timeSlot ? String(timeSlot).split('-')[1].trim() : '12:00 PM'),
      },
      availableCount: results.filter((r) => r.availabilityStatus === 'available').length,
      workers: results,
    });
  } catch (err: any) {
    console.error('getAvailableWorkers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// BUSINESS-SIDE DISPATCH: ASSIGN JOB TO WORKER
router.post('/businesses/:businessId/assign-job', async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      workerId,
      bookingId,
      title,
      serviceCategory,
      customerName,
      customerPhone,
      customerEmail,
      location,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      durationMinutes,
      rate,
      notes,
    } = req.body;

    if (!workerId || !title || !customerName || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required assignment fields.' });
    }

    // Resolve business name
    const allBusinesses = await db.select().from(businesses);
    const matchedBiz = allBusinesses.find((b) => b.id === businessId);
    const bizName =
      matchedBiz?.businessName ||
      (businessId.includes('spa') ? 'Onyx Luxury Spa & Wellness' : 'Glow Salon & Hair Studio');

    const jobId = `job-wrk-${Date.now()}`;
    const newRate = rate ? String(rate) : '85.00';

    const [newJob] = await db
      .insert(workerJobs)
      .values({
        id: jobId,
        workerId,
        bookingId: bookingId || null,
        businessId,
        businessName: bizName,
        title,
        serviceCategory: serviceCategory || 'On-Site Specialist Service',
        customerName,
        customerPhone: customerPhone || '+1 (555) 000-0000',
        customerEmail: customerEmail || 'customer@uspot.com',
        location: location || 'Client Location',
        scheduledDate,
        scheduledStartTime: scheduledStartTime || '10:00 AM',
        scheduledEndTime: scheduledEndTime || '11:30 AM',
        durationMinutes: Number(durationMinutes) || 90,
        status: 'scheduled',
        rate: newRate,
        tip: '0.00',
        totalPayout: newRate,
        notes: notes || 'Assigned via Business Portal Availability Dispatcher',
      })
      .returning();

    res.json({
      success: true,
      job: newJob,
      message: `Job #${newJob.id} successfully assigned to worker!`,
    });
  } catch (err: any) {
    console.error('assign-job error:', err);
    res.status(500).json({ error: err.message });
  }
});

// BUSINESS-SIDE DISPATCH: ADD / INVITE NEW STAFF TO BUSINESS
router.post('/businesses/:businessId/staff', async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      fullName,
      email,
      phone,
      title,
      department,
      hourlyRate,
      commissionPercentage,
      contractType,
      workDays, // array of numbers e.g. [1, 2, 3, 4, 5]
      startTime,
      endTime,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Staff member full name and email are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const initials =
      cleanName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST';

    // Resolve business
    const allBusinesses = await db.select().from(businesses);
    const matchedBiz = allBusinesses.find(
      (b) =>
        b.id === businessId ||
        b.businessName.toLowerCase() === businessId.toLowerCase()
    );
    const resolvedBizId = matchedBiz?.id || businessId;
    const bizName =
      matchedBiz?.businessName ||
      (businessId.includes('spa') ? 'Onyx Luxury Spa & Wellness' : 'Glow Salon & Hair Studio');

    // 1. Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, trimmedEmail));
    let workerUser = existingUser;

    if (!workerUser) {
      const workerId = `user-wrk-${Date.now()}`;
      const username =
        trimmedEmail.split('@')[0] + '_' + Math.floor(100 + Math.random() * 900);
      const [newUser] = await db
        .insert(users)
        .values({
          id: workerId,
          role: 'worker',
          roleLabel: 'Worker',
          status: 'active',
          email: trimmedEmail,
          username,
          phone: phone || null,
          nickname: cleanName.split(' ')[0],
          fullName: cleanName,
          referralCode: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
          emailVerified: true,
          phoneVerified: Boolean(phone),
          timezone: 'America/New_York',
          avatarInitials: initials,
          department: department || title || 'On-site Specialist & Staff',
          primaryServiceCategory: matchedBiz?.category || 'Specialist Services',
          yearsOfExperience: '5',
          memberSince: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        })
        .returning();
      workerUser = newUser;
    } else if (workerUser.role !== 'worker' && workerUser.role !== 'specialist') {
      // Elevate or update user role if needed
      const [updated] = await db
        .update(users)
        .set({
          role: 'worker',
          roleLabel: 'Worker',
          department: department || title || workerUser.department || 'Specialist Services',
          updatedAt: new Date(),
        })
        .where(eq(users.id, workerUser.id))
        .returning();
      workerUser = updated;
    }

    // 2. Check if contract already exists for this worker + business
    const allContracts = await db.select().from(workerContracts);
    let contract = allContracts.find(
      (c) => c.workerId === workerUser.id && (c.businessId === resolvedBizId || c.businessId === businessId)
    );

    if (!contract) {
      const contractId = `ctr-${workerUser.id}-${Date.now().toString().slice(-4)}`;
      const [newContract] = await db
        .insert(workerContracts)
        .values({
          id: contractId,
          workerId: workerUser.id,
          businessId: resolvedBizId,
          businessName: bizName,
          title: title || 'Certified Specialist & Operator',
          contractType: contractType || 'independent_contractor',
          status: 'active',
          hourlyRate: hourlyRate ? String(hourlyRate) : '85.00',
          commissionPercentage: commissionPercentage ? String(commissionPercentage) : '75.00',
          startDate: new Date().toISOString().split('T')[0],
          terms: `Authorized certified specialist and team member agreement for ${bizName}.`,
          signedAt: new Date(),
          signature: `${cleanName} (Authorized Staff Member)`,
        })
        .returning();
      contract = newContract;
    }

    // 3. Create recurring weekly schedule for this business
    const selectedDays =
      Array.isArray(workDays) && workDays.length > 0 ? workDays : [1, 2, 3, 4, 5];
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const day of selectedDays) {
      const existingSlot = await db
        .select()
        .from(workerBusinessSchedules)
        .where(
          and(
            eq(workerBusinessSchedules.workerId, workerUser.id),
            eq(workerBusinessSchedules.businessId, resolvedBizId),
            eq(workerBusinessSchedules.dayOfWeek, Number(day))
          )
        );

      if (existingSlot.length === 0) {
        await db.insert(workerBusinessSchedules).values({
          id: `sch-${workerUser.id}-${resolvedBizId}-d${day}-${Date.now()}`,
          workerId: workerUser.id,
          businessId: resolvedBizId,
          businessName: bizName,
          dayOfWeek: Number(day),
          dayName: DAY_NAMES[Number(day)] || 'Weekday',
          startTime: startTime || '09:00 AM',
          endTime: endTime || '05:00 PM',
          isAvailable: true,
          hourlyRate: hourlyRate ? String(hourlyRate) : '85.00',
          notes: `Regular shift for ${bizName}`,
        });
      }
    }

    // 4. Ensure demo jobs and transactions so worker portal is active
    await ensureWorkerDemoData(workerUser.id);

    res.status(201).json({
      success: true,
      worker: workerUser,
      contract,
      message: `Staff member ${cleanName} added to ${bizName} successfully!`,
    });
  } catch (err: any) {
    console.error('add-staff error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SEED DEMO WORKER (ON-DEMAND)
router.post('/seed-demo', async (req, res) => {
  try {
    await ensureDefaultWorkerUser();
    res.json({ success: true, message: 'Default worker and schedule successfully seeded.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Worker Dashboard Stats
router.get('/:workerId/dashboard', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoData(workerId);

    const jobs = await db
      .select()
      .from(workerJobs)
      .where(eq(workerJobs.workerId, workerId));

    const transactions = await db
      .select()
      .from(workerTransactions)
      .where(eq(workerTransactions.workerId, workerId));

    const todayStr = new Date().toISOString().split('T')[0];

    const todayJobs = jobs.filter((j) => j.scheduledDate === todayStr);
    const activeJobs = jobs.filter((j) => j.status === 'in_progress');
    const scheduledJobs = jobs.filter((j) => j.status === 'scheduled');
    const completedJobs = jobs.filter((j) => j.status === 'completed');

    // Financial calculations
    let totalEarnings = 0;
    let totalTips = 0;
    let pendingPayouts = 0;

    for (const tx of transactions) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'job_payout' || tx.type === 'bonus' || tx.type === 'tip') {
        totalEarnings += amt;
      }
      if (tx.type === 'tip') {
        totalTips += amt;
      }
      if (tx.status === 'pending' || tx.status === 'processing') {
        pendingPayouts += amt;
      }
    }

    // Available balance = completed earnings not yet deposited
    const completedJobSum = completedJobs.reduce((acc, j) => acc + (parseFloat(j.totalPayout) || 0), 0);
    const availableBalance = Math.max(0, completedJobSum - 300);

    const totalHoursLogged = jobs.reduce((acc, j) => {
      if (j.status === 'completed' || j.status === 'in_progress') {
        return acc + (j.durationMinutes || 60) / 60;
      }
      return acc;
    }, 0);

    const averageJobPayout = completedJobs.length > 0 ? totalEarnings / completedJobs.length : 165.0;

    // Weekly breakdown
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyEarnings = days.map((day, idx) => ({
      day,
      amount: [180, 225, 170, 210, 195, 0, 0][idx] || 0,
      jobs: [1, 1, 1, 1, 1, 0, 0][idx] || 0,
    }));

    const stats = {
      todayJobsCount: todayJobs.length,
      activeJobsCount: activeJobs.length,
      scheduledJobsCount: scheduledJobs.length,
      completedJobsCount: completedJobs.length,
      totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
      rating: 4.95,
      totalEarnings,
      availableBalance: availableBalance || 375.0,
      pendingPayouts: pendingPayouts || 170.0,
      averageJobPayout: Math.round(averageJobPayout * 100) / 100,
      totalTips: totalTips || 75.0,
      weeklyEarnings,
    };

    // Current active job & next upcoming job
    const activeJob = activeJobs[0] || null;
    const nextJob = scheduledJobs[0] || null;

    res.json({
      stats,
      activeJob,
      nextJob,
      todayJobs,
      recentJobs: jobs.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. My Jobs (List)
router.get('/:workerId/jobs', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status, search } = req.query;
    await ensureWorkerDemoData(workerId);

    let allJobs = await db
      .select()
      .from(workerJobs)
      .where(eq(workerJobs.workerId, workerId))
      .orderBy(desc(workerJobs.scheduledDate));

    if (status && status !== 'all') {
      allJobs = allJobs.filter((j) => j.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      allJobs = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.customerName.toLowerCase().includes(q) ||
          j.businessName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    res.json(allJobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Job Details
router.get('/:workerId/jobs/:jobId', async (req, res) => {
  try {
    const { workerId, jobId } = req.params;
    const [job] = await db
      .select()
      .from(workerJobs)
      .where(and(eq(workerJobs.workerId, workerId), eq(workerJobs.id, jobId)));

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Check-In / Progress
router.patch('/:workerId/jobs/:jobId/check-in', async (req, res) => {
  try {
    const { workerId, jobId } = req.params;
    const { checkInNotes, checkInPhotos } = req.body;

    const [updated] = await db
      .update(workerJobs)
      .set({
        status: 'in_progress',
        checkInTime: new Date(),
        checkInNotes: checkInNotes || 'Worker arrived on site and verified arrival.',
        checkInPhotos: checkInPhotos || [],
        updatedAt: new Date(),
      })
      .where(and(eq(workerJobs.workerId, workerId), eq(workerJobs.id, jobId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Completion Check-Out
router.patch('/:workerId/jobs/:jobId/check-out', async (req, res) => {
  try {
    const { workerId, jobId } = req.params;
    const {
      checkOutNotes,
      customerSignOffName,
      signature,
      tip = 0,
      rating = 5,
      feedback,
    } = req.body;

    const [existing] = await db
      .select()
      .from(workerJobs)
      .where(and(eq(workerJobs.workerId, workerId), eq(workerJobs.id, jobId)));

    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const rateNum = parseFloat(existing.rate) || 0;
    const tipNum = parseFloat(tip) || 0;
    const totalPayoutNum = rateNum + tipNum;

    const [updated] = await db
      .update(workerJobs)
      .set({
        status: 'completed',
        checkOutTime: new Date(),
        checkOutNotes: checkOutNotes || 'Job completed to high quality standard.',
        customerSignOffName: customerSignOffName || existing.customerName,
        signature: signature || `${customerSignOffName || existing.customerName} (Verified Sign-Off)`,
        tip: tipNum.toFixed(2),
        totalPayout: totalPayoutNum.toFixed(2),
        rating: rating || 5,
        feedback: feedback || 'Great service and prompt arrival.',
        updatedAt: new Date(),
      })
      .where(and(eq(workerJobs.workerId, workerId), eq(workerJobs.id, jobId)))
      .returning();

    // Create a transaction payout in workerTransactions table
    const txId = `tx-wrk-${Date.now()}`;
    await db.insert(workerTransactions).values({
      id: txId,
      workerId,
      jobId,
      type: 'job_payout',
      amount: totalPayoutNum.toFixed(2),
      status: 'completed',
      description: `Job payout for ${existing.title}`,
      referenceNumber: `WRK-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      payoutMethod: 'Direct Deposit (ACH)',
      date: new Date().toISOString().split('T')[0],
    });

    res.json({ success: true, job: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Job Calendar
router.get('/:workerId/calendar', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoData(workerId);

    const jobs = await db
      .select()
      .from(workerJobs)
      .where(eq(workerJobs.workerId, workerId));

    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6 & 7. My Contracts (List & Details)
router.get('/:workerId/contracts', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoData(workerId);

    const contracts = await db
      .select()
      .from(workerContracts)
      .where(eq(workerContracts.workerId, workerId));

    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:workerId/contracts/:contractId', async (req, res) => {
  try {
    const { workerId, contractId } = req.params;
    const [contract] = await db
      .select()
      .from(workerContracts)
      .where(and(eq(workerContracts.workerId, workerId), eq(workerContracts.id, contractId)));

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:workerId/contracts/:contractId/sign', async (req, res) => {
  try {
    const { workerId, contractId } = req.params;
    const { signature } = req.body;

    const [updated] = await db
      .update(workerContracts)
      .set({
        status: 'active',
        signedAt: new Date(),
        signature: signature || 'Signed Digitally',
        updatedAt: new Date(),
      })
      .where(and(eq(workerContracts.workerId, workerId), eq(workerContracts.id, contractId)))
      .returning();

    res.json({ success: true, contract: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Earnings Overview
router.get('/:workerId/earnings', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoData(workerId);

    const jobs = await db
      .select()
      .from(workerJobs)
      .where(eq(workerJobs.workerId, workerId));

    const transactions = await db
      .select()
      .from(workerTransactions)
      .where(eq(workerTransactions.workerId, workerId))
      .orderBy(desc(workerTransactions.createdAt));

    let gross = 0;
    let tips = 0;
    for (const tx of transactions) {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'job_payout' || tx.type === 'bonus' || tx.type === 'tip') {
        gross += amt;
      }
      if (tx.type === 'tip') {
        tips += amt;
      }
    }

    const completed = jobs.filter((j) => j.status === 'completed');
    const totalHours = jobs.reduce((acc, j) => {
      if (j.status === 'completed' || j.status === 'in_progress') {
        return acc + (j.durationMinutes || 60) / 60;
      }
      return acc;
    }, 0);

    res.json({
      totalEarnings: gross || 655.0,
      availableBalance: 375.0,
      averageJobPayout: completed.length ? Math.round((gross / completed.length) * 100) / 100 : 165.0,
      totalTips: tips || 75.0,
      totalHoursWorked: Math.round(totalHours * 10) / 10,
      recentPayouts: transactions.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Transaction History
router.get('/:workerId/transactions', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoData(workerId);

    const transactions = await db
      .select()
      .from(workerTransactions)
      .where(eq(workerTransactions.workerId, workerId))
      .orderBy(desc(workerTransactions.createdAt));

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Request Payout
router.post('/:workerId/payout', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { amount, bankName, accountMasked } = req.body;

    const txId = `tx-wrk-${Date.now()}`;
    const [tx] = await db
      .insert(workerTransactions)
      .values({
        id: txId,
        workerId,
        type: 'direct_deposit',
        amount: parseFloat(amount || 300).toFixed(2),
        status: 'completed',
        description: `Direct Deposit transfer to ${bankName || 'Chase'} (${accountMasked || '•••• 7712'})`,
        referenceNumber: `ACH-${Math.floor(100000 + Math.random() * 900000)}`,
        payoutMethod: `${bankName || 'Bank Account'} (${accountMasked || '•••• 7712'})`,
        date: new Date().toISOString().split('T')[0],
      })
      .returning();

    res.json({ success: true, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// WORKER MULTI-BUSINESS SCHEDULE (GET & PUT)
// ============================================================================
router.get('/:workerId/schedule', async (req, res) => {
  try {
    const { workerId } = req.params;
    await ensureWorkerDemoSchedule(workerId);

    const schedules = await db
      .select()
      .from(workerBusinessSchedules)
      .where(eq(workerBusinessSchedules.workerId, workerId))
      .orderBy(workerBusinessSchedules.dayOfWeek, workerBusinessSchedules.startTime);

    res.json(schedules);
  } catch (err: any) {
    console.error('get schedule error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:workerId/schedule', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots array is required' });
    }

    // Delete existing schedule for this worker and insert the updated ones
    await db
      .delete(workerBusinessSchedules)
      .where(eq(workerBusinessSchedules.workerId, workerId));

    if (slots.length > 0) {
      const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const valuesToInsert = slots.map((s: any, idx: number) => ({
        id: s.id || `sch-${workerId}-${s.dayOfWeek || 0}-${Date.now()}-${idx}`,
        workerId,
        businessId: s.businessId,
        businessName: s.businessName || 'Business Partner',
        dayOfWeek: Number(s.dayOfWeek) ?? 0,
        dayName: s.dayName || DAY_NAMES[Number(s.dayOfWeek) || 0],
        startTime: s.startTime || '09:00 AM',
        endTime: s.endTime || '12:00 PM',
        isAvailable: s.isAvailable !== false,
        hourlyRate: s.hourlyRate ? String(s.hourlyRate) : '85.00',
        notes: s.notes || null,
        updatedAt: new Date(),
      }));

      await db.insert(workerBusinessSchedules).values(valuesToInsert);
    }

    const updated = await db
      .select()
      .from(workerBusinessSchedules)
      .where(eq(workerBusinessSchedules.workerId, workerId))
      .orderBy(workerBusinessSchedules.dayOfWeek, workerBusinessSchedules.startTime);

    res.json({ success: true, count: updated.length, schedule: updated });
  } catch (err: any) {
    console.error('update schedule error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

