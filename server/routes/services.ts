import { Router } from 'express';
import { db } from '../db';
import { serviceCategories, businessServices } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET all service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.select().from(serviceCategories);
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET services for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const services = await db
      .select()
      .from(businessServices)
      .where(eq(businessServices.businessId, req.params.businessId));
    
    // Map numerical fields to numbers to match frontend types
    const mapped = services.map((s) => ({
      ...s,
      base_price: Number(s.basePrice),
      hourly_rate: s.hourlyRate ? Number(s.hourlyRate) : undefined,
      duration_minutes: s.durationMinutes,
      requires_approval: s.requiresApproval,
      photo_url: s.photoUrl,
      thumbnail_url: s.thumbnailUrl,
      gallery_photos: (s.galleryPhotos as string[]) || [],
      assigned_workers_count: s.assignedWorkersCount || 1,
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST add service
router.post('/', async (req, res) => {
  try {
    const s = req.body;
    const [inserted] = await db
      .insert(businessServices)
      .values({
        id: s.id || `srv-${Date.now()}`,
        businessId: s.business_id || s.businessId,
        serviceCategoryId: s.service_category_id || s.serviceCategoryId,
        categoryName: s.category_name || s.categoryName,
        name: s.name,
        photoUrl: s.photo_url || s.photoUrl,
        thumbnailUrl: s.thumbnail_url || s.thumbnailUrl,
        galleryPhotos: s.gallery_photos || s.galleryPhotos || [],
        basePrice: String(s.base_price || s.basePrice),
        hourlyRate: s.hourly_rate ? String(s.hourly_rate) : undefined,
        durationMinutes: s.duration_minutes || s.durationMinutes || 45,
        requiresApproval: s.requires_approval ?? s.requiresApproval ?? false,
        status: s.status || 'active',
        assignedWorkersCount: s.assigned_workers_count || 1,
      })
      .returning();

    res.status(201).json({
      ...inserted,
      base_price: Number(inserted.basePrice),
      hourly_rate: inserted.hourlyRate ? Number(inserted.hourlyRate) : undefined,
      duration_minutes: inserted.durationMinutes,
      requires_approval: inserted.requiresApproval,
      photo_url: inserted.photoUrl,
      thumbnail_url: inserted.thumbnailUrl,
      gallery_photos: (inserted.galleryPhotos as string[]) || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update service
router.patch('/:id', async (req, res) => {
  try {
    const s = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (s.name) updateData.name = s.name;
    if (s.categoryName || s.category_name) updateData.categoryName = s.categoryName || s.category_name;
    if (s.basePrice || s.base_price) updateData.basePrice = String(s.basePrice || s.base_price);
    if (s.durationMinutes || s.duration_minutes) updateData.durationMinutes = s.durationMinutes || s.duration_minutes;
    if (s.photoUrl || s.photo_url) updateData.photoUrl = s.photoUrl || s.photo_url;
    if (s.thumbnailUrl || s.thumbnail_url) updateData.thumbnailUrl = s.thumbnailUrl || s.thumbnail_url;
    if (s.galleryPhotos || s.gallery_photos) updateData.galleryPhotos = s.galleryPhotos || s.gallery_photos;
    if (s.status) updateData.status = s.status;

    const [updated] = await db
      .update(businessServices)
      .set(updateData)
      .where(eq(businessServices.id, req.params.id))
      .returning();

    res.json({
      ...updated,
      base_price: Number(updated.basePrice),
      duration_minutes: updated.durationMinutes,
      requires_approval: updated.requiresApproval,
      photo_url: updated.photoUrl,
      thumbnail_url: updated.thumbnailUrl,
      gallery_photos: (updated.galleryPhotos as string[]) || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(businessServices).where(eq(businessServices.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
