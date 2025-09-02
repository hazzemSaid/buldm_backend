/**
 * @file db.ts
 * @description Database connection and management utilities for MongoDB using Mongoose
 * @requires mongoose
 * @requires express
 */
import mongoose from "mongoose";
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * @type {Promise<typeof mongoose> | null}
 * @private
 * @description Holds the ongoing MongoDB connection promise to prevent multiple connection attempts
 */
let connectPromise: Promise<typeof mongoose> | null = null;

/**
 * Checks if the MongoDB connection is currently active
 * @function isConnected
 * @returns {boolean} True if connected, false otherwise
 * @example
 * if (isConnected()) {
 *   // Perform database operations
 * }
 */
export function isConnected(): boolean {
  // 1 = connected, 2 = connecting
  return mongoose.connection.readyState === 1;
}

/**
 * Initializes the MongoDB connection with connection pooling and error handling
 * @async
 * @function initDB
 * @returns {Promise<typeof mongoose>} Mongoose instance when connected
 * @throws {Error} If MONGODB_URL is not set or connection fails
 * @example
 * try {
 *   await initDB();
 *   // Database is ready to use
 * } catch (error) {
 *   console.error('Failed to connect to database:', error);
 * }
 */
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

/**
 * Express middleware that ensures database connectivity before processing requests
 * @function connectionGuard
 * @type {import('express').RequestHandler}
 * @description Middleware that checks for an active database connection and initializes one if needed.
 *              Particularly useful in serverless environments where connections might be closed due to inactivity.
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * @example
 * app.use(connectionGuard);
 */
export const connectionGuard: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isConnected()) return next();
  try {
    await initDB();
    next();
  } catch (err: any) {
    res.status(503).json({
      status: "error",
      error: "Database unavailable",
      statuscode: 503,
      data: err?.message || "no data",
    });
  }
};

// Connection event listeners for monitoring connection state
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));

// Additional connection events for better debugging
mongoose.connection.on("connecting", () => console.log("Connecting to MongoDB..."));
mongoose.connection.on("connected", () => console.log("MongoDB connected successfully"));
mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error));
mongoose.connection.on("close", () => console.log("MongoDB connection closed"));
