// Cloudflare Worker (with static assets): handles POST /api/submit, otherwise serves public/.
// Receives a multipart/form-data screenshot submission, validates it,
// and forwards it to a Discord channel via webhook.

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_TOTAL_SIZE = MAX_FILE_SIZE * MAX_FILES + 1024 * 1024; // files + form overhead
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_TEXT_LENGTH = 256; // username / description truncation
const RATE_LIMIT_MAX = 5; // submissions
const RATE_LIMIT_WINDOW_SECONDS = 600; // per 10 minutes, per IP

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_TEXT_LENGTH);
}

function safeFileName(originalName) {
  const ext = (originalName.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `screenshot-${crypto.randomUUID()}.${ext || 'png'}`;
}

async function verifyTurnstile(token, secretKey, ip) {
  // Distinguish "not configured" from "challenge failed" so siteverify is always called when a secret exists,
  // and a missing secret doesn't silently masquerade as a failed bot check.
  if (!secretKey) return 'missing_secret';
  if (!token) return 'missing_token';

  const body = new FormData();
  body.append('secret', secretKey);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });

  const data = await result.json();
  return data.success === true ? 'ok' : 'failed';
}

async function checkRateLimit(env, ip) {
  if (!env.RATE_LIMIT || !ip) return true; // no KV bound or unknown IP: skip silently

  const key = `rl:${ip}`;
  const current = parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);

  if (current >= RATE_LIMIT_MAX) return false;

  await env.RATE_LIMIT.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

async function handleSubmit(request, env) {
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_TOTAL_SIZE) {
    return jsonResponse({ error: 'Submission too large.' }, 413);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ error: 'Invalid request format.' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP');

  if (!(await checkRateLimit(env, ip))) {
    return jsonResponse(
      { error: 'Too many submissions from this network. Please try again later.' },
      429
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ error: 'Could not read submission.' }, 400);
  }

  // Honeypot: a hidden field real users never fill in. Bots that auto-fill every field get rejected.
  if (sanitizeText(form.get('website'))) {
    return jsonResponse({ error: 'Submission rejected.' }, 400);
  }

  const turnstileToken = form.get('cf-turnstile-response');
  const turnstileResult = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
  if (turnstileResult === 'missing_secret') {
    return jsonResponse(
      { error: 'Server is not configured for bot verification (missing TURNSTILE_SECRET_KEY).' },
      500
    );
  }
  if (turnstileResult !== 'ok') {
    return jsonResponse({ error: 'Bot verification failed. Please try again.' }, 400);
  }

  const files = form.getAll('screenshots').filter((entry) => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return jsonResponse({ error: 'Please attach at least one screenshot.' }, 400);
  }
  if (files.length > MAX_FILES) {
    return jsonResponse({ error: `You can upload up to ${MAX_FILES} screenshots.` }, 400);
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonResponse({ error: `Unsupported file type: ${file.type || 'unknown'}` }, 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: `"${file.name}" exceeds the 10 MB limit.` }, 400);
    }
  }

  if (!env.DISCORD_WEBHOOK_URL) {
    return jsonResponse({ error: 'Server is not configured. Please contact the site owner.' }, 500);
  }

  const username = sanitizeText(form.get('username')) || 'Anonymous';
  const description = sanitizeText(form.get('description')) || 'No description provided.';

  const discordForm = new FormData();
  const attachmentNames = [];

  files.forEach((file, index) => {
    const fileName = safeFileName(file.name || `image-${index}`);
    attachmentNames.push(fileName);
    discordForm.append(`files[${index}]`, file, fileName);
  });

  const payload = {
    // Never let submitted text trigger @everyone/@here or role/user pings.
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: 'New Screenshot Submission',
        color: 0x5865f2,
        fields: [
          { name: 'Username / Player ID', value: username, inline: true },
          { name: 'Description', value: description },
        ],
        image: { url: `attachment://${attachmentNames[0]}` },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  discordForm.append('payload_json', JSON.stringify(payload));

  const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: discordForm,
  });

  if (!discordResponse.ok) {
    console.error('Discord webhook error', discordResponse.status, await discordResponse.text());
    return jsonResponse({ error: 'Failed to deliver submission to Discord.' }, 502);
  }

  return jsonResponse({ success: true, message: 'Screenshot submitted successfully!' });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed.' }, 405);
      }
      return handleSubmit(request, env);
    }

    // Everything else is a static asset from public/.
    return env.ASSETS.fetch(request);
  },
};
