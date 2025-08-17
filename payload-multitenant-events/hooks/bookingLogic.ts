// Booking logic hooks for Payload CMS
// Handles booking creation, cancellation, notifications, and logs
import { AfterChangeHook } from 'payload/types';

/**
 * AfterChange hook for Bookings collection
 * Handles booking confirmation, waitlisting, cancellation, and promotion
 */
export const bookingAfterChange: AfterChangeHook = async ({ doc, previousDoc, operation, req, collection }) => {
  const payload = req.payload;
  if (operation === 'create') {
    // Booking created: check event capacity
    const event = await payload.findByID({ collection: 'events', id: doc.event });
    const confirmedCount = await payload.count({
      collection: 'bookings',
      where: { event: { equals: doc.event }, status: { equals: 'confirmed' } },
    });
    if (confirmedCount < event.capacity) {
      // Confirm booking
      await payload.update({
        collection: 'bookings',
        id: doc.id,
        data: { status: 'confirmed' },
      });
      // Notification
      await payload.create({
        collection: 'notifications',
        data: {
          user: doc.user,
          booking: doc.id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your booking for ${event.title} is confirmed!`,
          tenant: doc.tenant,
        },
      });
      // Log
      await payload.create({
        collection: 'booking-logs',
        data: {
          booking: doc.id,
          event: doc.event,
          user: doc.user,
          action: 'auto_confirm',
          note: 'Auto-confirmed on booking',
          tenant: doc.tenant,
        },
      });
    } else {
      // Waitlist booking
      await payload.update({
        collection: 'bookings',
        id: doc.id,
        data: { status: 'waitlisted' },
      });
      await payload.create({
        collection: 'notifications',
        data: {
          user: doc.user,
          booking: doc.id,
          type: 'waitlisted',
          title: 'Waitlisted',
          message: `You are waitlisted for ${event.title}.`,
          tenant: doc.tenant,
        },
      });
      await payload.create({
        collection: 'booking-logs',
        data: {
          booking: doc.id,
          event: doc.event,
          user: doc.user,
          action: 'auto_waitlist',
          note: 'Auto-waitlisted on booking',
          tenant: doc.tenant,
        },
      });
    }
  }
  if (operation === 'update' && previousDoc && previousDoc.status !== 'canceled' && doc.status === 'canceled') {
    // Booking canceled
    const event = await payload.findByID({ collection: 'events', id: doc.event });
    await payload.create({
      collection: 'notifications',
      data: {
        user: doc.user,
        booking: doc.id,
        type: 'booking_canceled',
        title: 'Booking Canceled',
        message: `Your booking for ${event.title} was canceled.`,
        tenant: doc.tenant,
      },
    });
    await payload.create({
      collection: 'booking-logs',
      data: {
        booking: doc.id,
        event: doc.event,
        user: doc.user,
        action: 'cancel_confirmed',
        note: 'Booking canceled by user',
        tenant: doc.tenant,
      },
    });
    // Promote oldest waitlisted booking
    const waitlisted = await payload.find({
      collection: 'bookings',
      where: {
        event: { equals: doc.event },
        status: { equals: 'waitlisted' },
        tenant: { equals: doc.tenant },
      },
      sort: 'createdAt',
      limit: 1,
    });
    if (waitlisted.docs.length > 0) {
      const promote = waitlisted.docs[0];
      await payload.update({
        collection: 'bookings',
        id: promote.id,
        data: { status: 'confirmed' },
      });
      await payload.create({
        collection: 'notifications',
        data: {
          user: promote.user,
          booking: promote.id,
          type: 'waitlist_promoted',
          title: 'Promoted from Waitlist',
          message: `You have been promoted to confirmed for ${event.title}.`,
          tenant: doc.tenant,
        },
      });
      await payload.create({
        collection: 'booking-logs',
        data: {
          booking: promote.id,
          event: doc.event,
          user: promote.user,
          action: 'promote_from_waitlist',
          note: 'Promoted from waitlist after cancellation',
          tenant: doc.tenant,
        },
      });
    }
  }
};
