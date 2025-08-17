import { CollectionConfig } from 'payload/types';
import { tenantAccess } from '../../access/tenantAdmins';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Attendee', value: 'attendee' },
        { label: 'Organizer', value: 'organizer' },
        { label: 'Admin', value: 'admin' },
      ],
      required: true,
      defaultValue: 'attendee',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      // Not required for first admin creation: use validate to enforce only if tenants exist
      validate: async (value, { payload }) => {
        const tenants = await payload.find({ collection: 'tenants', limit: 1 });
        if (tenants.totalDocs > 0 && !value) {
          return 'Tenant is required once at least one tenant exists.';
        }
        return true;
      },
    },
  ],
  access: {
    read: tenantAccess,
    create: tenantAccess,
    update: tenantAccess,
    delete: tenantAccess,
  },
};

export default Users;
