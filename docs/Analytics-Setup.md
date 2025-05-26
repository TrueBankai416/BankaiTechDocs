# Analytics Setup

This documentation site supports optional PostHog analytics integration to track page views and user interactions.

## PostHog CORS Error Fix ✅

The PostHog CORS error has been **completely resolved**. PostHog configuration has been removed from the default setup to eliminate security scan issues and CORS errors.

Analytics are now completely optional and can be added by users who want them.

## Setting Up PostHog Analytics (Optional)

If you want to enable analytics for your documentation site, follow these steps:

### 1. Get a PostHog API Key

1. Sign up for a free account at [PostHog](https://posthog.com)
2. Create a new project
3. Copy your project API key from the project settings

### 2. Add Environment Variable

1. Open the `.env` file in the root directory
2. Add your PostHog API key:
   ```env
   # Add this line with your actual API key:
   POSTHOG_API_KEY=your_posthog_project_key
   ```

### 3. Add PostHog Configuration

1. Open `docusaurus.config.ts`
2. Find the `plugins: [` array around line 88
3. Add the PostHog plugin configuration:
   ```typescript
   plugins: [
     // ... existing plugins ...
     
     // Add PostHog analytics
     [
       'posthog-docusaurus',
       {
         id: 'posthog',
         apiKey: process.env.POSTHOG_API_KEY,
         appUrl: 'https://us.i.posthog.com', // optional
         enableInDevelopment: false, // optional
       },
     ],
     
   ],
   ```

### 4. Install PostHog Package

Add the PostHog Docusaurus plugin:
```bash
npm install posthog-docusaurus
```

### 5. Verify Setup

After configuration:

1. Build and serve your site: `npm run build && npm run serve`
2. Check the browser developer tools for any errors
3. Verify analytics are being recorded in your PostHog dashboard

## Configuration Options

Available PostHog configuration options:

- **apiKey**: Your PostHog project API key (required)
- **appUrl**: PostHog instance URL (defaults to `https://us.i.posthog.com`)
- **enableInDevelopment**: Set to `false` to disable analytics in development mode

## Privacy Considerations

- PostHog respects user privacy preferences
- Consider adding a privacy policy if collecting analytics
- Users can opt out using browser settings or privacy extensions

## No Analytics Needed?

The site works perfectly without any analytics configuration. Simply skip this setup if you don't need usage tracking.
