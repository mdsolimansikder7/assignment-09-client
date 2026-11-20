import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing. Set it in your environment variables.");
}

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
};

export const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
} else {
  globalForMongo.mongoClient = client;
}

export const db = client.db("gearloop-auth");
