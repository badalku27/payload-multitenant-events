import { CollectionConfig } from 'payload/types';
import { tenantAccess } from '../../access/tenantAdmins';

const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Booking Confirmed', value: 'booking_confirmed' },
        { label: 'Waitlisted', value: 'waitlisted' },
        { label: 'Booking Canceled', value: 'booking_canceled' },
        { label: 'Waitlist Promoted', value: 'waitlist_promoted' },
      ],
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
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

export default Notifications;
