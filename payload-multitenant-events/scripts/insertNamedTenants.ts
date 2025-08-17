import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = uri.split('/').pop()?.split('?')[0] || 'payloadmulti';

async function run() {
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const tenants = [
    { _id: 'ba', name: 'Badal', slug: 'ba', createdAt: new Date() },
    { _id: 'ro', name: 'Rohan', slug: 'ro', createdAt: new Date() },
    { _id: 'vi', name: 'Vikash', slug: 'vi', createdAt: new Date() },
    { _id: 'aj', name: 'Ajay', slug: 'aj', createdAt: new Date() }
  ];
  const result = await db.collection('tenants').insertMany(tenants);
  console.log('Inserted tenants:', result.insertedIds);
  await client.close();
}

run().catch(console.error);
