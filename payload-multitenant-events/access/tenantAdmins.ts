// Multi-tenant access control for Payload collections
// Only allow access to records within the user's tenant
import { Access, Where } from 'payload/types';

export const tenantAccess: Access = async ({ req: { user }, operation }) => {
  if (!user) return false;
  // Admins have full access to their tenant
  if (user.role === 'admin') {
    return { tenant: { equals: user.tenant } };
  }
  // Organizers can manage events and view all bookings in their tenant
  if (user.role === 'organizer') {
    if (operation === 'read' || operation === 'update' || operation === 'create') {
      return { tenant: { equals: user.tenant } };
    }
    return false;
  }
  // Attendees can only view their own bookings/notifications
  if (user.role === 'attendee') {
    if (operation === 'read') {
      // For Bookings/Notifications, filter by user and tenant
      return {
        and: [
          { tenant: { equals: user.tenant } },
          { user: { equals: user.id } },
        ],
      };
    }
    if (operation === 'create') {
      return { tenant: { equals: user.tenant } };
    }
    return false;
  }
  return false;
};
