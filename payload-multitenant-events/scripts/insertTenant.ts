import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = uri.split('/').pop()?.split('?')[0] || 'payloadmulti';

async function run() {
  if (!uri) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const result = await db.collection('tenants').insertOne({ name: 'Tenant A', createdAt: new Date() });
  console.log('Inserted tenant:', result.insertedId);
  await client.close();
}

run().catch(console.error);
