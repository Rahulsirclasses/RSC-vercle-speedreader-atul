import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

// DEBUG LOG: Print a masked version of the URI to check if Vercel is using the correct one
if (MONGODB_URI) {
  const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log("🔍 [DEBUG MONGODB] Active Connection String:", maskedUri);
}

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  )
}

/**
 * Global singleton to prevent multiple Mongoose connections in Next.js dev mode
 * (hot reloads would create new connections every time without this pattern).
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Force Mongoose to use the correct database name even if the URI parser gets confused by Vercel environment variables
    const dbNameMatch = MONGODB_URI.match(/\/([^/?]+)(?:\?|$)/);
    const databaseName = dbNameMatch ? dbNameMatch[1] : 'speed-reading-app';

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // connection pooling
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: databaseName, // Explicitly tell MongoDB which database to authenticate against
    }

    console.log(`🚀 [MongoDB] Attempting connection to database: ${databaseName}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB connected successfully to ${databaseName}`)
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
