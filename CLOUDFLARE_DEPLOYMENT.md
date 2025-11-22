# Cloudflare Pages Deployment Guide

This Next.js application is configured to deploy on Cloudflare Pages.

## Cloudflare Pages Configuration

**Important**: This project requires Next.js 15.2.3+ for Cloudflare Pages compatibility.

In your Cloudflare Pages project settings, use the following configuration:

### Build Settings
- **Framework preset**: Next.js (or None)
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Node.js version**: 18 or later

**Note**: If you're using Git integration, make sure to set the build output directory to `.vercel/output/static` in the build configuration.

### Environment Variables

Add these environment variables in Cloudflare Pages dashboard:

```
# Cloudflare Stream (for video streaming)
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE=your_customer_code

# Stripe (for payments - optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Firebase Setup Required

Before deploying, you must enable these Firebase services in the [Firebase Console](https://console.firebase.google.com/project/new-calude-minecmms):

1. **Firestore Database** - Create in production mode
2. **Authentication** - Enable Email/Password and Google providers
3. **Storage** - Enable for file uploads
4. **Add your domain** to authorized domains in Authentication settings

### Firestore Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Anyone can read active cameras
    match /cameras/{cameraId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creator_id || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Chat messages
    match /chat_messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.user_id || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Favorites
    match /favorite_cameras/{favoriteId} {
      allow read, create, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow write: if request.auth != null;
    }

    // Alerts
    match /alerts/{alertId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Deployment Options

### Option 1: Deploy via Cloudflare Pages UI (Recommended)

1. Build the project locally:
   ```bash
   npm run pages:build
   ```

2. The build output will be in `.vercel/output/static/`

3. In Cloudflare Pages dashboard:
   - Go to your Pages project
   - Upload the contents of `.vercel/output/static/` folder
   - Or connect your Git repository and use these build settings:
     - **Build command**: `npx @cloudflare/next-on-pages`
     - **Build output directory**: `.vercel/output/static`

### Option 2: Deploy via CLI

Requires Cloudflare API token. Set up authentication first:

```bash
# Set up Cloudflare API token
export CLOUDFLARE_API_TOKEN=your_token_here

# Build and deploy
npm run deploy
```

To get an API token, visit: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build for Cloudflare Pages
npm run pages:build

# Preview Cloudflare Pages build locally
npm run preview
```

## Troubleshooting

### Build fails with "Missing or insufficient permissions"
- This is expected during build time as Firestore is not accessible
- The app will work correctly once deployed with proper Firebase configuration

### Images not loading
- Make sure `images.unoptimized: true` is set in `next.config.mjs`
- Cloudflare Pages doesn't support Next.js Image Optimization

### Authentication not working
- Verify Firebase config in `lib/firebase/config.ts`
- Check that your domain is added to Firebase authorized domains
- Ensure environment variables are set correctly in Cloudflare Pages
