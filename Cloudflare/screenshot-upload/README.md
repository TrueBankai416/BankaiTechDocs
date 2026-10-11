# screenshot-upload

A sign-in-free screenshot submission page that forwards uploads to a Discord channel via webhook.

- `public/` — static upload page (HTML/CSS/JS), served as static assets.
- `src/index.js` — Worker script: serves `public/` and handles `POST /api/submit`.
- `wrangler.jsonc` — Worker configuration (static assets directory + entry point).

Full setup guide: [Screenshot Upload to Discord](https://docs.bankai-tech.com/Cloudflare/Docs/Screenshot%20Upload%20to%20Discord/Introduction) in the BankaiTech Docs.

## Required configuration

Set these as **secrets** on the Worker (via `wrangler secret put` or the dashboard's **Settings → Runtime variables and secrets**):

| Variable                | Description                                              |
| ------------------------ | --------------------------------------------------------- |
| `DISCORD_WEBHOOK_URL`    | Webhook URL for the target Discord channel.                |
| `TURNSTILE_SECRET_KEY`   | Secret key for the Turnstile widget used on the form.      |

Optional: add a `kv_namespaces` binding named `RATE_LIMIT` in `wrangler.jsonc` (or via the dashboard's **Bindings** tab) to enable basic per-IP rate limiting. Without it, rate limiting is skipped.

Replace `YOUR_TURNSTILE_SITE_KEY` in `public/index.html` with your Turnstile **site key** (this one is public, unlike the secret key).

## Local development

```bash
npm install -D wrangler
npx wrangler dev
```

Set local secrets with a `.dev.vars` file (not committed):

```bash title=".dev.vars"
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TURNSTILE_SECRET_KEY=...
```

## Deployment

```bash
npx wrangler deploy
```

Or connect the repository to Cloudflare Workers Builds for automatic deploys on push. See the full guide linked above for step-by-step dashboard instructions.
