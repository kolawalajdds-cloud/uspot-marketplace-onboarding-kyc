import { Router } from 'express';
import { db } from '../db';
import { customerSavedCards } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

function mapCard(c: any) {
  return {
    id: c.id,
    customer_id: c.customerId,
    cardholder_name: c.cardholderName,
    brand: c.brand,
    last4: c.last4,
    exp_month: c.expMonth,
    exp_year: c.expYear,
    is_default: c.isDefault,
    billing_address: c.billingAddress,
    created_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  };
}

// GET all saved cards (optionally filtered by ?customerId=)
router.get('/', async (req, res) => {
  try {
    const { customerId } = req.query;
    let query;
    if (customerId) {
      query = db.select().from(customerSavedCards).where(eq(customerSavedCards.customerId, String(customerId)));
    } else {
      query = db.select().from(customerSavedCards);
    }
    const cards = await query;
    res.json(cards.map(mapCard));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all saved cards for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const cards = await db
      .select()
      .from(customerSavedCards)
      .where(eq(customerSavedCards.customerId, req.params.customerId));
    res.json(cards.map(mapCard));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new saved card
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      customer_id,
      cardholderName,
      cardholder_name,
      brand,
      last4,
      expMonth,
      exp_month,
      expYear,
      exp_year,
      isDefault,
      is_default,
      billingAddress,
      billing_address,
    } = req.body;

    const targetCustomerId = customerId || customer_id || 'user-customer';
    const makeDefault = isDefault ?? is_default ?? false;

    // If default, unset previous defaults
    if (makeDefault) {
      await db
        .update(customerSavedCards)
        .set({ isDefault: false })
        .where(eq(customerSavedCards.customerId, targetCustomerId));
    }

    const [created] = await db
      .insert(customerSavedCards)
      .values({
        id: `card-${Date.now()}`,
        customerId: targetCustomerId,
        cardholderName: cardholderName || cardholder_name,
        brand: brand || 'visa',
        last4: last4 || '4242',
        expMonth: expMonth || exp_month || '12',
        expYear: expYear || exp_year || '28',
        isDefault: makeDefault,
        billingAddress: billingAddress || billing_address || null,
        gatewayToken: `tok_neon_${Date.now()}`,
      })
      .returning();

    res.status(201).json({
      id: created.id,
      customer_id: created.customerId,
      cardholder_name: created.cardholderName,
      brand: created.brand,
      last4: created.last4,
      exp_month: created.expMonth,
      exp_year: created.expYear,
      is_default: created.isDefault,
      billing_address: created.billingAddress,
      created_at: created.createdAt.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH set card as default
router.patch('/:id/default', async (req, res) => {
  try {
    const { customerId } = req.body;
    if (customerId) {
      await db
        .update(customerSavedCards)
        .set({ isDefault: false })
        .where(eq(customerSavedCards.customerId, customerId));
    }

    const [updated] = await db
      .update(customerSavedCards)
      .set({ isDefault: true })
      .where(eq(customerSavedCards.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE saved card
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(customerSavedCards).where(eq(customerSavedCards.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
