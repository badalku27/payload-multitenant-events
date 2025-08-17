// Custom API route for canceling a booking
import { NextFunction, Request, Response } from 'express';
import payload from 'payload';

/**
 * POST /api/cancel-booking
 * Body: { booking: bookingId }
 * Auth required
 */
export default async function cancelBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { booking } = req.body;
    if (!booking) return res.status(400).json({ error: 'Booking required' });
    // Find booking
    const bookingDoc = await payload.findByID({ collection: 'bookings', id: booking });
    if (!bookingDoc) return res.status(404).json({ error: 'Booking not found' });
    // Only allow cancel if user owns booking or is organizer/admin in tenant
    if (
      bookingDoc.user !== user.id &&
      !(user.role === 'organizer' || user.role === 'admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Set status to canceled (hook will handle notifications/logs/promotion)
    const updated = await payload.update({
      collection: 'bookings',
      id: booking,
      data: { status: 'canceled' },
    });
    return res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
}
