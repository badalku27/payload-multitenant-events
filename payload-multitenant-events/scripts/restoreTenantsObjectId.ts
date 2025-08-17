import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = uri.split('/').pop()?.split('?')[0] || 'payloadmulti';

async function run() {
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  // Remove all existing tenants
  await db.collection('tenants').deleteMany({});
  // Insert new tenants with ObjectId _id and slug
  const tenants = [
    { name: 'Badal', slug: 'ba', createdAt: new Date() },
    { name: 'Rohan', slug: 'ro', createdAt: new Date() },
    { name: 'Vikash', slug: 'vi', createdAt: new Date() },
    { name: 'Ajay', slug: 'aj', createdAt: new Date() }
  ];
  const result = await db.collection('tenants').insertMany(tenants);
  console.log('Restored tenants with ObjectId:', result.insertedIds);
  await client.close();
}

run().catch(console.error);
