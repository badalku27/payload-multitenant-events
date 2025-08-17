import { CollectionConfig } from 'payload/types';

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: { readOnly: true },
      defaultValue: () => new Date().toISOString(),
    },
  ],
  access: {
    read: () => true, // Only admins can create tenants, but all users can read their own tenant name
    create: ({ req: { user } }) => user && user.role === 'admin',
    update: ({ req: { user } }) => user && user.role === 'admin',
    delete: ({ req: { user } }) => user && user.role === 'admin',
  },
};

export default Tenants;
