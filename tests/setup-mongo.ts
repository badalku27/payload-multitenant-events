import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemoryServer: MongoMemoryServer;

export const setupMongoDB = async (): Promise<string> => {
  if (!mongoMemoryServer) {
    mongoMemoryServer = await MongoMemoryServer.create();
  }
  const uri = mongoMemoryServer.getUri();
  process.env.MONGO_URI = uri;
  console.log("MongoDB Memory Server started:", uri);
  return uri;
};

export const teardownMongoDB = async () => {
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
};
