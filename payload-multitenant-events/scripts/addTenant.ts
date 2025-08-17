import payload from 'payload';

(async () => {
  await payload.init({ secret: process.env.PAYLOAD_SECRET, local: true });
  const tenant = await payload.create({
    collection: 'tenants',
    data: { name: 'Default Tenant' },
  });
  console.log('Tenant created:', tenant);
  process.exit(0);
})();
