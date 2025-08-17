import { CollectionConfig } from 'payload/types';

// TEMPORARY: Open read access for initial setup. Remove hooks to avoid blocking API responses.
// IMPORTANT: Replace with tenant-based access after first admin is created.
const Tenants: CollectionConfig = {
  slug: 'tenants', // Must match relationship in Users.ts
  admin: { useAsTitle: 'slug' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Short unique code for this tenant (e.g. tenant-a, tenant-b)' },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: { readOnly: true },
      defaultValue: () => new Date().toISOString(),
    },
  ],
  access: {
    // TEMPORARY: Allow all users to read tenants for relationship dropdowns during initial setup.
    read: () => true,
    create: ({ req: { user } }) => !!user && user.role === 'admin',
    update: ({ req: { user } }) => !!user && user.role === 'admin',
    delete: ({ req: { user } }) => !!user && user.role === 'admin',
  },
  // hooks: {}, // Commented out: add hooks here after setup if needed
};

export default Tenants;
