import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";

let connectPromise: Promise<typeof mongoose> | null = null;

export function isConnected(): boolean {
  // 1 = connected, 2 = connecting
  return mongoose.connection.readyState === 1;
}

export async function initDB(): Promise<typeof mongoose> {
  if (isConnected()) return mongoose;
  if (connectPromise) return connectPromise;

  const raw = process.env.MONGODB_URL || "";
  const uri = raw.trim();
  if (!uri) throw new Error("MONGODB_URL is not set");

  mongoose.set("strictQuery", false);

  connectPromise = mongoose
    .connect(uri, {
      maxPoolSize: 10, // connection pool
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000, // fast failover
      socketTimeoutMS: 45000,
      retryWrites: true,
      // heartbeatFrequencyMS is driver-level; Mongoose forwards it
      heartbeatFrequencyMS: 10000 as any,
    } as any)
    .then((m) => {
      console.log("MongoDB connected (pooled)");
      return m;
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err?.message || err);
      connectPromise = null; // allow retry next request
      throw err;
    });

  return connectPromise;
}

// Express middleware: ensure DB connectivity per request (useful on serverless)
export async function connectionGuard(_req: Request, res: Response, next: NextFunction) {
  if (isConnected()) return next();
  try {
    await initDB();
    return next();
  } catch (err: any) {
    return res.status(503).json({
      status: "error",
      error: "Database unavailable",
      statuscode: 503,
      data: err?.message || "no data",
    });
  }
}

// Optional: log connection state changes
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
