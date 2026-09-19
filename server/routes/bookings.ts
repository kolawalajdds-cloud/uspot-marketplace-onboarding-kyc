import { Router } from 'express';
import { db } from '../db';
import { bookings, bookingItems, marketplaceTransactions, businesses } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Helper to get complete booking with items
async function getCompleteBooking(bookingId: string) {
  const [b] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!b) return null;

  const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, bookingId));

  return {
    id: b.id,
    reference_number: b.referenceNumber,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_email: b.customerEmail,
    customer_phone: b.customerPhone || undefined,
    business_id: b.businessId,
    business_name: b.businessName,
    business_logo: b.businessLogo || undefined,
    business_category: b.businessCategory || undefined,
    status: b.status,
    payment_status: b.paymentStatus,
    payment_method: b.paymentMethod,
    payment_method_display: b.paymentMethodDisplay || undefined,
    total_amount: Number(b.totalAmount),
    total_price: Number(b.totalAmount),
    discount_amount: Number(b.discountAmount || 0),
    tax_amount: Number(b.taxAmount || 0),
    net_amount: Number(b.netAmount),
    booking_date: b.scheduledDate,
    scheduled_date: b.scheduledDate,
    scheduled_start_time: b.scheduledStartTime,
    scheduled_end_time: b.scheduledEndTime,
    total_duration_minutes: b.totalDurationMinutes,
    special_instructions: b.specialInstructions || undefined,
    notes: b.notes || undefined,
    refund_status: b.refundStatus || undefined,
    refund_estimated_date: b.refundEstimatedDate || undefined,
    refund_id: b.refundId || undefined,
    items: items.map((it) => ({
      id: String(it.id),
      booking_id: it.bookingId,
      business_service_id: it.businessServiceId,
      service_name: it.serviceName,
      price_charged: Number(it.priceCharged),
      price: Number(it.priceCharged),
      duration_minutes: it.durationMinutes,
      worker_id: it.workerId || undefined,
      worker_name: it.workerName || undefined,
      scheduled_start: it.scheduledStart || undefined,
      scheduled_end: it.scheduledEnd || undefined,
    })),
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  };
}

// GET bookings list
router.get('/', async (req, res) => {
  try {
    const { customerId, businessId } = req.query;
    let query = db.select().from(bookings).orderBy(desc(bookings.createdAt));
    
    let allBookings;
    if (customerId) {
      allBookings = await db.select().from(bookings).where(eq(bookings.customerId, String(customerId))).orderBy(desc(bookings.createdAt));
    } else if (businessId) {
      allBookings = await db.select().from(bookings).where(eq(bookings.businessId, String(businessId))).orderBy(desc(bookings.createdAt));
    } else {
      allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    }

    const populated = await Promise.all(allBookings.map((b) => getCompleteBooking(b.id)));
    res.json(populated.filter(Boolean));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await getCompleteBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create booking
router.post('/create', async (req, res) => {
  try {
    const {
      customerId,
      businessId,
      items,
      dateStr,
      startTime,
      paymentMethod,
      paymentMethodDisplay,
      notes,
    } = req.body;

    const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId));
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `BK-${randomDigits}`;
    const referenceNumber = `#BK-${randomDigits}`;

    const totalDuration = (items || []).reduce((acc: number, it: any) => acc + (it.duration_minutes || it.durationMinutes || 45), 0);
    const grossTotal = (items || []).reduce((acc: number, it: any) => acc + (it.price_charged || it.price || it.base_price || 0), 0);

    // If client supplied totalAmount (what the customer actually paid at checkout), respect it exactly!
    const clientTotal = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : undefined;
    const clientTax = req.body.taxAmount !== undefined ? Number(req.body.taxAmount) : undefined;
    const clientRef = req.body.referenceNumber ? String(req.body.referenceNumber) : undefined;

    const netTotal = clientTotal !== undefined ? clientTotal : Number(grossTotal.toFixed(2));
    const taxAmount = clientTax !== undefined ? clientTax : 0.00;
    const finalRef = clientRef || referenceNumber;

    const isPaidOnline = paymentMethod === 'credit_card';

    // Insert Booking
    await db.insert(bookings).values({
      id: bookingId,
      referenceNumber: finalRef,
      customerId: customerId || 'user-customer',
      customerName: req.body.customerName || 'Alex Taylor',
      customerEmail: req.body.customerEmail || 'alex_shopper@uspot.com',
      customerPhone: req.body.customerPhone || '+1 (555) 234-5678',
      businessId,
      businessName: biz?.businessName || 'Business Partner',
      businessCategory: biz?.category || 'Salon & Spa',
      status: 'confirmed',
      paymentStatus: isPaidOnline ? 'paid' : 'unpaid',
      paymentMethod: paymentMethod || 'credit_card',
      paymentMethodDisplay: paymentMethodDisplay || (isPaidOnline ? 'Mastercard •••• 4242' : 'Cash on Arrival'),
      totalAmount: String(netTotal),
      discountAmount: '0.00',
      taxAmount: String(taxAmount),
      netAmount: String(netTotal),
      scheduledDate: dateStr,
      scheduledStartTime: startTime,
      scheduledEndTime: '11:30 AM',
      totalDurationMinutes: totalDuration || 60,
      specialInstructions: notes || null,
      notes: notes || null,
    });

    // Insert Booking Items
    for (const it of items || []) {
      await db.insert(bookingItems).values({
        bookingId,
        businessServiceId: it.business_service_id || it.id,
        serviceName: it.service_name || it.name,
        priceCharged: String(it.price_charged || it.base_price || 0),
        durationMinutes: it.duration_minutes || 45,
        workerId: it.worker_id || null,
        workerName: it.worker_name || 'Assigned Specialist',
      });
    }

    // Insert marketplace financial transaction if paid
    if (isPaidOnline) {
      const commissionRate = 10.0;
      const commissionAmount = Number(((netTotal * commissionRate) / 100).toFixed(2));
      const businessAmount = Number((netTotal - commissionAmount).toFixed(2));

      await db.insert(marketplaceTransactions).values({
        id: `TX-${Date.now()}`,
        bookingId,
        businessId,
        businessName: biz?.businessName || 'Business Partner',
        customerName: req.body.customerName || 'Alex Taylor',
        customerEmail: req.body.customerEmail || 'alex_shopper@uspot.com',
        serviceName: items?.[0]?.name || items?.[0]?.service_name || 'Booked Service',
        type: 'BOOKING_PAYMENT',
        grossAmount: String(netTotal),
        commissionRate: String(commissionRate),
        platformCommission: String(commissionAmount),
        businessAmount: String(businessAmount),
        paymentStatus: 'paid',
        withdrawalStatus: 'none',
        paymentGateway: 'NMI Gateway',
      });
    }

    const complete = await getCompleteBooking(bookingId);
    res.status(201).json({ success: true, booking: complete, message: 'Appointment confirmed successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update status (cancel, complete, etc.)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const updateData: any = { status, updatedAt: new Date() };

    if (status === 'cancelled') {
      updateData.refundStatus = 'initiated';
      updateData.refundEstimatedDate = '3 - 5 business days';
      updateData.refundId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      if (cancellationReason) {
        updateData.notes = cancellationReason;
      }
    }

    await db.update(bookings).set(updateData).where(eq(bookings.id, req.params.id));
    const updated = await getCompleteBooking(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH reschedule booking
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { newDate, newStartTime } = req.body;
    await db
      .update(bookings)
      .set({
        scheduledDate: newDate,
        scheduledStartTime: newStartTime,
        status: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, req.params.id));

    const updated = await getCompleteBooking(req.params.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
