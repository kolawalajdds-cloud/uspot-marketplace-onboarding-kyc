import { Router } from 'express';
import { db } from '../db';
import {
  users,
  businesses,
  businessHours,
  businessAmenities,
  kycVerifications,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { getCompleteBusiness } from './businesses';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST login/switch user
router.post('/login', async (req, res) => {
  try {
    const { email, username, identifier, role, password } = req.body;
    const term = (identifier || email || username || '').trim().toLowerCase();

    if (!term && !role) {
      return res.status(400).json({ error: 'Please enter your email or username.' });
    }

    const allUsers = await db.select().from(users);
    let user = term
      ? allUsers.find(
          (u) =>
            u.email?.toLowerCase() === term ||
            u.username?.toLowerCase() === term ||
            u.id.toLowerCase() === term
        )
      : null;

    if (!user && role) {
      user = allUsers.find((u) => u.role.toLowerCase() === role.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'No user found with the provided credentials. Please check your email or register.' });
    }

    // Find the user's business if any
    const allBusinesses = await db.select().from(businesses);
    const userBiz = allBusinesses.find(
      (b) =>
        (b.userId && b.userId === user.id) ||
        (b.email && b.email.toLowerCase() === user.email.toLowerCase())
    );

    const completeBiz = userBiz ? await getCompleteBusiness(userBiz.id) : null;

    res.json({
      success: true,
      user,
      business: completeBiz,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update user
router.patch('/:id', async (req, res) => {
  try {
    const [updated] = await db
      .update(users)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST register new user/vendor
router.post('/register', async (req, res) => {
  try {
    const {
      accountType, // 'personal' | 'business'
      email,
      password,
      firstName,
      lastName,
      phone,
      jobTitle,
      nickname,
      username: providedUsername,
      marketingOptIn,
    } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, First Name, and Last Name are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.email, trimmedEmail));
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please login instead.' });
    }

    const isBusiness = accountType === 'business';
    const role = isBusiness ? 'business' : 'customer';
    const roleLabel = isBusiness ? 'Business Entity' : 'Customer';
    const newUserId = `user-${role}-${Date.now()}`;
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullName = `${cleanFirstName} ${cleanLastName}`;
    const initials = ((cleanFirstName[0] || 'U') + (cleanLastName[0] || '')).toUpperCase();
    const username =
      providedUsername?.trim() ||
      trimmedEmail.split('@')[0] + '_' + Math.floor(100 + Math.random() * 900);
    const finalNickname = nickname?.trim() || cleanFirstName;

    const [newUser] = await db
      .insert(users)
      .values({
        id: newUserId,
        role,
        roleLabel,
        status: 'active',
        email: trimmedEmail,
        username,
        phone: phone?.trim() || null,
        nickname: finalNickname,
        fullName,
        referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        emailVerified: true,
        phoneVerified: Boolean(phone),
        timezone: 'America/New_York',
        avatarInitials: initials,
        department: jobTitle?.trim() || (isBusiness ? 'Business Operations' : 'Marketplace Customer'),
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
      .returning();

    let createdBusiness = null;

    if (isBusiness) {
      const businessId = `biz-${Date.now()}`;
      let domainName = trimmedEmail.split('@')[1]?.split('.')[0] || '';
      if (['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'proton'].includes(domainName.toLowerCase())) {
        domainName = '';
      }
      const businessName = domainName
        ? domainName.charAt(0).toUpperCase() + domainName.slice(1) + ' Services'
        : `${fullName}'s Business`;

      const [newBiz] = await db
        .insert(businesses)
        .values({
          id: businessId,
          userId: newUser.id,
          businessName,
          legalEntityName: `${businessName} LLC`,
          category: 'Coworking & Creative Hub',
          description: `Professional spaces, reservations, and merchant operations by ${fullName}.`,
          streetAddress: '100 Market St, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          phone: phone?.trim() || '+1 (555) 019-2834',
          email: trimmedEmail,
          status: 'Draft',
          subscriptionPlan: 'Starter',
          salesTaxRate: '8.87',
          currency: 'USD',
          automaticInvoicing: true,
          avatarChar: businessName[0]?.toUpperCase() || 'B',
        })
        .returning();

      // Seed default business hours
      for (let day = 0; day <= 6; day++) {
        await db.insert(businessHours).values({
          businessId,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '19:00',
          isClosed: day === 0, // Closed Sunday
        });
      }

      // Seed initial amenities
      await db.insert(businessAmenities).values([
        {
          businessId,
          category: 'General & Comfort',
          name: 'High-Speed Wi-Fi',
          description: '1Gbps enterprise connection',
          checked: true,
        },
        {
          businessId,
          category: 'General & Comfort',
          name: 'Restrooms',
          description: 'Clean restrooms on premises',
          checked: true,
        },
        {
          businessId,
          category: 'Tech & Workspace',
          name: 'Power Outlets',
          description: 'Power outlets readily available at all spots',
          checked: true,
        },
      ]);

      // Seed draft KYC verification
      await db.insert(kycVerifications).values({
        businessId,
        legalEntityType: 'Limited Liability Company (LLC)',
        status: 'Draft',
        riskTier: 'Low',
        sanctionsStatus: 'Not Started',
        tinMatchStatus: 'Not Started',
      });

      createdBusiness = newBiz;
    }

    res.status(201).json({
      success: true,
      user: newUser,
      business: createdBusiness,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Failed to register account' });
  }
});

// POST direct create user
router.post('/', async (req, res) => {
  try {
    const {
      id,
      role,
      roleLabel,
      status,
      email,
      username,
      phone,
      nickname,
      fullName,
      referralCode,
      emailVerified,
      phoneVerified,
      timezone,
      avatarInitials,
      department,
      primaryServiceCategory,
      yearsOfExperience,
      memberSince,
    } = req.body;

    const trimmedEmail = (email || '').trim().toLowerCase();
    const newId = id || `user-${role || 'customer'}-${Date.now()}`;
    const [created] = await db
      .insert(users)
      .values({
        id: newId,
        role: role || 'customer',
        roleLabel: roleLabel || (role === 'business' ? 'Business' : 'Customer'),
        status: status || 'active',
        email: trimmedEmail,
        username: username || trimmedEmail.split('@')[0] + '_' + Math.floor(100 + Math.random() * 900),
        phone: phone || null,
        nickname: nickname || fullName?.split(' ')[0] || null,
        fullName: fullName || trimmedEmail.split('@')[0],
        referralCode: referralCode || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        emailVerified: emailVerified ?? true,
        phoneVerified: phoneVerified ?? true,
        timezone: timezone || 'America/New_York',
        avatarInitials:
          avatarInitials ||
          (fullName ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'),
        department: department || (role === 'business' ? 'Vendor Merchant' : 'Customer'),
        primaryServiceCategory: primaryServiceCategory || null,
        yearsOfExperience: yearsOfExperience ? String(yearsOfExperience) : null,
        memberSince:
          memberSince ||
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
      .returning();

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
