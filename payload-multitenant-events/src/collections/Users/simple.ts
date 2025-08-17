import type { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true, // Open for initial setup
    create: () => true, // Open for initial setup
    update: () => true, // Open for initial setup
    delete: () => true, // Open for initial setup
    admin: () => true, // Open for initial setup
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      // Make tenant optional for seeding
      required: false,
    },
    {
      name: 'lastLoggedInTenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

export default Users
