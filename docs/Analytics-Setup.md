# Analytics Setup

This documentation site includes optional PostHog analytics integration to track page views and user interactions.

## PostHog CORS Error Fix

If you were seeing CORS errors like:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://app.posthog.com/e/?ip=1&_=1748274014949&ver=1.46.2. (Reason: CORS request did not succeed). Status code: (null).
```

This was caused by PostHog trying to initialize with a placeholder API key. **This issue has been fixed** - PostHog will now only load when a valid API key is provided.

## Setting Up PostHog Analytics (Optional)

If you want to enable analytics for your documentation site:

### 1. Get a PostHog API Key

1. Sign up for a free account at [PostHog](https://posthog.com)
2. Create a new project
3. Copy your project API key (starts with `phc_`)

### 2. Update Environment Variables

1. Open the `.env` file in the root directory
2. Replace the placeholder PostHog API key:
   ```env
   # Replace this placeholder:
   POSTHOG_API_KEY=phc_PLACEHOLDER_API_KEY
   
   # With your real API key:
   POSTHOG_API_KEY=phc_your_actual_api_key_here
   ```

### 3. Configuration Options

The PostHog configuration in `docusaurus.config.ts` includes these options:

- **apiKey**: Your PostHog project API key
- **appUrl**: PostHog instance URL (defaults to `https://us.i.posthog.com`)
- **enableInDevelopment**: Set to `false` to disable analytics in development mode

### 4. Verify Setup

After updating your API key:

1. Build and serve your site
2. Check the browser developer tools for any errors
3. Verify analytics are being recorded in your PostHog dashboard

## Privacy Considerations

- PostHog respects user privacy preferences
- Consider adding a privacy policy if collecting analytics
- Users can opt out using browser settings or privacy extensions

## Disabling Analytics

To completely disable analytics:

1. Set `POSTHOG_API_KEY=` (empty) in your `.env` file, or
2. Remove the PostHog configuration from `docusaurus.config.ts`

The site will work perfectly without analytics enabled.
