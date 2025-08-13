# Vercel Deployment Guide

## Prerequisites

- Node.js installed on your local machine
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Vercel CLI installed (`npm install -g vercel`)

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Login to Vercel

```bash
vercel login
```

### 4. Deploy to Vercel

```bash
vercel
```

Follow the prompts in the CLI. When asked about the settings:

- Set the build command to: `npm run vercel-build`
- Set the output directory to: `dist`
- Set the development command to: `npm run run:dev`

### 5. Set Environment Variables

After deployment, go to your Vercel project dashboard:

1. Navigate to Settings > Environment Variables
2. Add all the required environment variables from `.env.example`

### 6. Production Deployment

After testing the preview deployment, deploy to production:

```bash
vercel --prod
```

## Troubleshooting

### Static Files Not Loading

If static files are not loading correctly:

1. Verify that the build script is correctly copying static files to the dist folder
2. Check that the vercel.json configuration has the correct routes for static files

### MongoDB Connection Issues

If you're experiencing MongoDB connection issues:

1. Ensure your MongoDB connection string is correctly set in the Vercel environment variables
2. Check that your MongoDB Atlas cluster has the correct IP access settings (allow access from anywhere for Vercel deployments)

### Socket.IO Connection Issues

If real-time features are not working:

1. Ensure your client is connecting to the correct WebSocket endpoint
2. Verify that Vercel is correctly handling WebSocket connections

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express.js on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)