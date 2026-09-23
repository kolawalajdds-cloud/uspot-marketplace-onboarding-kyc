import { Router } from 'express';
import { db } from '../db';
import { businessReviews, reviewResponses, businesses } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Helper function to populate reviews with responses
async function populateReviews(reviews: any[]) {
  return Promise.all(
    reviews.map(async (r) => {
      const [resp] = await db
        .select()
        .from(reviewResponses)
        .where(eq(reviewResponses.reviewId, r.id));

      return {
        id: r.id,
        business_id: r.businessId,
        business_name: r.businessName,
        booking_id: r.bookingId || undefined,
        service_id: r.serviceId || undefined,
        service_name: r.serviceName || undefined,
        customer_id: r.customerId || undefined,
        customer_name: r.customerName,
        customer_avatar: r.customerAvatar || undefined,
        rating: r.rating,
        review_text: r.reviewText,
        media: (r.media as string[]) || [],
        created_at: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        time_ago: r.timeAgo || 'Recently',
        response_deadline: r.responseDeadline || undefined,
        response: resp
          ? {
              text: resp.responseText,
              responded_at: resp.respondedAt ? new Date(resp.respondedAt).toISOString() : new Date().toISOString(),
              responded_time_ago: resp.respondedTimeAgo || 'Responded recently',
              author_name: resp.authorName,
            }
          : undefined,
      };
    })
  );
}

// GET all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(businessReviews)
      .orderBy(desc(businessReviews.createdAt));
    const populated = await populateReviews(reviews);
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all reviews for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(businessReviews)
      .where(eq(businessReviews.businessId, req.params.businessId))
      .orderBy(desc(businessReviews.createdAt));

    const populated = await populateReviews(reviews);
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST submit customer review
router.post('/', async (req, res) => {
  try {
    const {
      businessId,
      bookingId,
      serviceId,
      serviceName,
      customerId,
      customerName,
      rating,
      reviewText,
      media,
    } = req.body;

    const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId));
    const reviewId = `rev-${Date.now()}`;

    const [created] = await db
      .insert(businessReviews)
      .values({
        id: reviewId,
        businessId,
        businessName: biz?.businessName || 'Business',
        bookingId,
        serviceId,
        serviceName,
        customerId: customerId || 'user-customer',
        customerName: customerName || 'Alex Taylor',
        customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        rating: Number(rating),
        reviewText,
        media: media || [],
        timeAgo: 'Just now',
        responseDeadline: 'Response needed within 24 hours to maintain "Fast Responder" badge.',
      })
      .returning();

    res.status(201).json({
      id: created.id,
      business_id: created.businessId,
      business_name: created.businessName,
      booking_id: created.bookingId || undefined,
      service_id: created.serviceId || undefined,
      service_name: created.serviceName || undefined,
      customer_id: created.customerId || undefined,
      customer_name: created.customerName,
      customer_avatar: created.customerAvatar || undefined,
      rating: created.rating,
      review_text: created.reviewText,
      media: (created.media as string[]) || [],
      created_at: created.createdAt.toISOString(),
      time_ago: created.timeAgo || 'Just now',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST vendor reply to review
router.post('/:id/reply', async (req, res) => {
  try {
    const { replyText, authorName } = req.body;
    const reviewId = req.params.id;

    // Check if reply already exists
    const [existing] = await db.select().from(reviewResponses).where(eq(reviewResponses.reviewId, reviewId));
    let saved;

    if (existing) {
      [saved] = await db
        .update(reviewResponses)
        .set({
          responseText: replyText,
          authorName: authorName || 'Management',
          respondedAt: new Date(),
          respondedTimeAgo: 'Just now',
        })
        .where(eq(reviewResponses.reviewId, reviewId))
        .returning();
    } else {
      [saved] = await db
        .insert(reviewResponses)
        .values({
          reviewId,
          authorName: authorName || 'Management',
          responseText: replyText,
          respondedTimeAgo: 'Just now',
        })
        .returning();
    }

    res.json({
      success: true,
      response: {
        text: saved.responseText,
        responded_at: saved.respondedAt.toISOString(),
        responded_time_ago: saved.respondedTimeAgo || 'Just now',
        author_name: saved.authorName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
