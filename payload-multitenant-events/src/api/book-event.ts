// Custom API route for booking an event
import { NextFunction, Request, Response } from 'express';
import payload from 'payload';

/**
 * POST /api/book-event
 * Body: { event: eventId }
 * Auth required
 */
export default async function bookEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { event } = req.body;
    if (!event) return res.status(400).json({ error: 'Event required' });
    // Find event
    const eventDoc = await payload.findByID({ collection: 'events', id: event });
    if (!eventDoc) return res.status(404).json({ error: 'Event not found' });
    // Check if already booked
    const existing = await payload.find({
      collection: 'bookings',
      where: { event: { equals: event }, user: { equals: user.id }, status: { not_equals: 'canceled' } },
    });
    if (existing.docs.length > 0) {
      return res.status(400).json({ error: 'Already booked' });
    }
    // Create booking (hook will handle status/notifications/logs)
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        event,
        user: user.id,
        tenant: user.tenant,
      },
    });
    return res.json({ booking });
  } catch (err) {
    next(err);
  }
}
