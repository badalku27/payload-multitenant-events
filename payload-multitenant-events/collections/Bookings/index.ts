import { CollectionConfig } from 'payload/types';
import { tenantAccess } from '../../access/tenantAdmins';

const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: { useAsTitle: 'event' },
  fields: [
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
      name: 'status',
      type: 'select',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Waitlisted', value: 'waitlisted' },
        { label: 'Canceled', value: 'canceled' },
      ],
      required: true,
      defaultValue: 'waitlisted',
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

export default Bookings;
