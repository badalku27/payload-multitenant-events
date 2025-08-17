import { CollectionConfig } from 'payload/types';
import { tenantAccess } from '../../access/tenantAdmins';

const BookingLogs: CollectionConfig = {
  slug: 'booking-logs',
  admin: { useAsTitle: 'action' },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'note',
      type: 'textarea',
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: { readOnly: true },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
  ],
  access: {
    read: tenantAccess,
    create: tenantAccess,
    update: tenantAccess,
    delete: tenantAccess,
  },
};

export default BookingLogs;
