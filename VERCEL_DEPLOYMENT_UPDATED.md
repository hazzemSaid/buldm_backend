# Updated Vercel Deployment Guide

## Changes Made to Fix Serverless Function Issues

The following changes have been made to make the application compatible with Vercel's serverless environment:

1. **Modified app.ts**:
   - Added conditional Socket.IO initialization that only runs in non-Vercel environments
   - Added REST API fallback for messaging when Socket.IO is not available
   - Improved MongoDB connection with retry logic
   - Added better error handling for environment variables
   - Modified server startup to only run in non-Vercel environments

2. **Updated api/index.js**:
   - Set the `VERCEL=1` environment flag
   - Properly imports the Express app (not the HTTP server)

3. **Updated vercel.json**:
   - Changed entry point from `dist/app.js` to `api/index.js`
   - Added support for serving static files from both `/static` and `/dist/static`
   - Added environment variable configuration

## Deployment Steps

### Prerequisites

- Node.js and npm installed
- Vercel CLI installed (`npm i -g vercel`)
- MongoDB Atlas account (or other MongoDB provider)

### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Login to Vercel** (if not already logged in):
   ```bash
   vercel login
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - When prompted, confirm the settings match your project
   - The build command should be: `npm run build`
   - The output directory should be: `dist`

5. **Set Environment Variables**:
   - Go to the Vercel dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all required environment variables from your `.env` file
   - Make sure to add `VERCEL=1` (this is also set in vercel.json)

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

7. **Verify Deployment**:
   - Open the deployment URL provided by Vercel
   - Test the API endpoints
   - Check the logs for any errors

## Troubleshooting

### MongoDB Connection Issues

- Ensure your MongoDB Atlas cluster allows connections from Vercel's IP addresses
- Add `0.0.0.0/0` to your MongoDB Atlas IP whitelist for testing (restrict this in production)
- Verify your MongoDB connection string is correctly set in Vercel environment variables

### Static Files Not Loading

- Check that your static files are being properly copied to the `dist/static` directory during build
- Verify the routes in `vercel.json` are correctly configured

### API Endpoints Not Working

- Check Vercel logs for any errors
- Ensure all required environment variables are set
- Test the API endpoints locally before deploying

### Socket.IO Not Working

Socket.IO will not work in Vercel's serverless environment. The application has been modified to:

1. Disable Socket.IO in Vercel environments
2. Provide a REST API fallback for messaging functionality

For real-time functionality in production, consider:

- Using a separate WebSocket service (like Pusher or Socket.IO Cloud)
- Deploying the Socket.IO server separately on a platform that supports long-running processes
- Using Vercel's Edge Functions for some real-time capabilities

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express.js to Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)