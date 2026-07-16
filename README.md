# CheeseFlow Website

The CheeseFlow website built with Astro and Tailwind CSS.

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

## Project Structure

```
/
├── public/             # Static assets (favicon, OG image, robots.txt)
├── functions/          # Cloudflare Pages Functions (locale middleware, contact API)
├── src/
│   ├── assets/         # Images processed by Astro
│   ├── components/
│   ├── content/        # Blog collections (en / zh)
│   ├── layouts/
│   └── pages/          # File-based routes under /en and /zh
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Features

- Bilingual marketing site (`/en`, `/zh`) with domain-based routing
- Responsive design with Tailwind CSS
- Contact form via Cloudflare Pages Function + HTTP email API
- Blog with content collections, RSS, and sitemap
- Image optimisation via `astro:assets`

## Contact Form Setup

The `/api/contact` endpoint (`functions/api/contact.ts`) sends mail through an HTTP
email API. Configure these environment variables in Cloudflare Pages (for both
`cheeseflow.com` and `cheeseflow.cn`):

- `EMAIL_API_URL` – Email API endpoint
- `EMAIL_API_KEY` – Bearer token for the email API
- `CONTACT_FROM_EMAIL` – Optional “from” address
- `CONTACT_RECIPIENT_EMAIL` – Optional destination mailbox

Form submissions redirect back to the originating page with `?contact=success` or
`?contact=error`. The footer shows a success or error message from those params.

## Deployment

### Cloudflare Pages

Deploy to Cloudflare Pages using Wrangler:

```bash
# Deploy (deploys to current git branch)
pnpm run deploy
```

**Important:** To deploy to production:
1. Make sure you're on the `master` branch (or the branch configured as production)
2. Run `pnpm run deploy`
3. In Cloudflare Pages dashboard → Settings → Production deployments, set `master` as the production branch
4. Future deployments to `master` will automatically update production

The deploy command deploys to whatever branch you're currently on. Configure which branch is production in the Cloudflare Pages dashboard.

### Domain-Based Routing

Domain-based routing is **automatic** via Cloudflare Pages Functions (`functions/_middleware.ts`):

- `cheeseflow.com` → redirects to `/en` (English)
- `cheeseflow.com.cn` → redirects to `/zh` (Chinese)
- `cheeseflow.cn` → redirects to `/zh` (Chinese)

**No manual configuration needed!** Just add the custom domains in Cloudflare Pages dashboard and the function will automatically handle the redirects.

## SEO

- **Sitemap:** Built at `/sitemap-index.xml` (and copied to `/sitemap.xml`). English URLs use `cheeseflow.com`; Chinese URLs use `cheeseflow.cn`, with matching hreflang alternates.
- **RSS:** English blog at `/feed.xml`, Chinese blog at `/feed-zh.xml`. Linked from both layouts for auto-discovery.
- **Structured data:** Organization, WebSite, Service, and Person JSON-LD on the homepage; Article schema on each blog post.
- **Hreflang:** `en` → `https://cheeseflow.com/...`, `zh` → `https://cheeseflow.cn/...`.
- **Open Graph:** Default image at `/og-default.jpg`; organisation logo at `/images/cheeseflow-logo.svg`.

### Submitting to Google Search Console

1. Add properties for `https://cheeseflow.com` and `https://cheeseflow.cn`.
2. Open **Sitemaps** and submit: `https://cheeseflow.com/sitemap-index.xml` (and the same path on `.cn` if the property is separate).
3. Request indexing for key URLs (e.g. `https://cheeseflow.com/en/`, `https://cheeseflow.cn/zh/`) if needed.

## Website

Live site: https://cheeseflow.com
Chinese site: https://cheeseflow.com.cn (redirects to `/zh`)
