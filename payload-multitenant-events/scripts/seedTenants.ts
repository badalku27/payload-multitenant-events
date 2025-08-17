import payload from 'payload';

export async function seedTenants() {
  // Ensure Payload is initialized
  if (!payload.db) {
    await payload.init({ secret: process.env.PAYLOAD_SECRET, local: true });
  }
  const now = new Date().toISOString();
  const tenants = [
    { name: 'Tenant A', slug: 'tenant-a', createdAt: now },
    { name: 'Tenant B', slug: 'tenant-b', createdAt: now },
  ];
  for (const tenant of tenants) {
    await payload.create({ collection: 'tenants', data: tenant });
  }
  console.log('Seeded tenants:', tenants.map(t => t.name).join(', '));
}

// If run directly, execute the seeding
if (require.main === module) {
  seedTenants().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
