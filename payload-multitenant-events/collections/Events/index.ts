import { CollectionConfig } from 'payload/types';
import { tenantAccess } from '../../access/tenantAdmins';

const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: ({ user }) => user ? { tenant: { equals: user.tenant } } : {},
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

export default Events;
