// Seed script for multi-tenant event booking system
// Creates 2 tenants, each with 1 organizer, 3 attendees, 2 events
import payload from 'payload';

async function seed() {
  await payload.init({ secret: process.env.PAYLOAD_SECRET, local: true });

  // Create tenants
  const tenant1 = await payload.create({ collection: 'tenants', data: { name: 'Tenant One' } });
  const tenant2 = await payload.create({ collection: 'tenants', data: { name: 'Tenant Two' } });

  // Users for tenant1
  const organizer1 = await payload.create({
    collection: 'users',
    data: { name: 'Org One', email: 'org1@tenant1.com', role: 'organizer', tenant: tenant1.id, password: 'test1234' },
  });
  const attendees1 = await Promise.all([
    payload.create({ collection: 'users', data: { name: 'Attendee 1', email: 'a1@tenant1.com', role: 'attendee', tenant: tenant1.id, password: 'test1234' } }),
    payload.create({ collection: 'users', data: { name: 'Attendee 2', email: 'a2@tenant1.com', role: 'attendee', tenant: tenant1.id, password: 'test1234' } }),
    payload.create({ collection: 'users', data: { name: 'Attendee 3', email: 'a3@tenant1.com', role: 'attendee', tenant: tenant1.id, password: 'test1234' } }),
  ]);
  // Users for tenant2
  const organizer2 = await payload.create({
    collection: 'users',
    data: { name: 'Org Two', email: 'org2@tenant2.com', role: 'organizer', tenant: tenant2.id, password: 'test1234' },
  });
  const attendees2 = await Promise.all([
    payload.create({ collection: 'users', data: { name: 'Attendee 1', email: 'a1@tenant2.com', role: 'attendee', tenant: tenant2.id, password: 'test1234' } }),
    payload.create({ collection: 'users', data: { name: 'Attendee 2', email: 'a2@tenant2.com', role: 'attendee', tenant: tenant2.id, password: 'test1234' } }),
    payload.create({ collection: 'users', data: { name: 'Attendee 3', email: 'a3@tenant2.com', role: 'attendee', tenant: tenant2.id, password: 'test1234' } }),
  ]);
  // Events for tenant1
  await payload.create({
    collection: 'events',
    data: { title: 'Tenant1 Event 1', description: 'First event', date: new Date(Date.now() + 86400000).toISOString(), capacity: 2, organizer: organizer1.id, tenant: tenant1.id },
  });
  await payload.create({
    collection: 'events',
    data: { title: 'Tenant1 Event 2', description: 'Second event', date: new Date(Date.now() + 172800000).toISOString(), capacity: 3, organizer: organizer1.id, tenant: tenant1.id },
  });
  // Events for tenant2
  await payload.create({
    collection: 'events',
    data: { title: 'Tenant2 Event 1', description: 'First event', date: new Date(Date.now() + 86400000).toISOString(), capacity: 1, organizer: organizer2.id, tenant: tenant2.id },
  });
  await payload.create({
    collection: 'events',
    data: { title: 'Tenant2 Event 2', description: 'Second event', date: new Date(Date.now() + 172800000).toISOString(), capacity: 2, organizer: organizer2.id, tenant: tenant2.id },
  });

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
