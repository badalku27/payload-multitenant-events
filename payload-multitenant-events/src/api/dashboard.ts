// Organizer dashboard endpoint
import { NextFunction, Request, Response } from 'express';
import payload from 'payload';

/**
 * GET /api/dashboard
 * Auth required (organizer or admin)
 * Returns event stats and recent booking logs for the user's tenant
 */
export default async function dashboardHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Get all upcoming events for tenant
    const now = new Date().toISOString();
    const events = await payload.find({
      collection: 'events',
      where: {
        tenant: { equals: user.tenant },
        date: { greater_than_equal: now },
      },
      limit: 100,
    });
    // For each event, get booking stats
    const eventStats = await Promise.all(events.docs.map(async (event) => {
      const [confirmed, waitlisted, canceled] = await Promise.all([
        payload.count({ collection: 'bookings', where: { event: { equals: event.id }, status: { equals: 'confirmed' } } }),
        payload.count({ collection: 'bookings', where: { event: { equals: event.id }, status: { equals: 'waitlisted' } } }),
        payload.count({ collection: 'bookings', where: { event: { equals: event.id }, status: { equals: 'canceled' } } }),
      ]);
      return {
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        confirmedCount: confirmed,
        waitlistedCount: waitlisted,
        canceledCount: canceled,
        percentageFilled: event.capacity ? (confirmed / event.capacity) * 100 : 0,
      };
    }));
    // Summary analytics
    const totalEvents = events.docs.length;
    const totalConfirmed = eventStats.reduce((sum, e) => sum + e.confirmedCount, 0);
    const totalWaitlisted = eventStats.reduce((sum, e) => sum + e.waitlistedCount, 0);
    const totalCanceled = eventStats.reduce((sum, e) => sum + e.canceledCount, 0);
    // Recent booking logs
    const logs = await payload.find({
      collection: 'booking-logs',
      where: { tenant: { equals: user.tenant } },
      sort: '-createdAt',
      limit: 5,
    });
    return res.json({
      events: eventStats,
      summary: {
        totalEvents,
        totalConfirmed,
        totalWaitlisted,
        totalCanceled,
      },
      recentLogs: logs.docs,
    });
  } catch (err) {
    next(err);
  }
}
