// src/lib/db.ts
import mongoose from "mongoose";

/**
 * Connect to MongoDB using MONGODB_URI.
 * Uses global cached connection to avoid multiple connections in dev (Next.js HMR).
 */

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache;
}

const cached: MongooseCache = global._mongooseCache || {
  conn: null,
  promise: null,
};

if (!cached) global._mongooseCache = cached;

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // add other options if needed
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;
