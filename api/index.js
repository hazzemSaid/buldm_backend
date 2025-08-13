// Serverless function entry point for Vercel
// Set environment flag for Vercel
process.env.VERCEL = "1";

// Import the Express app (not the HTTP server)
module.exports = require('../dist/app.js').default;