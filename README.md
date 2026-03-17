# CheeseFlow Website

The CheeseFlow website built with Astro and Tailwind CSS.

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
/
├── public/
│   └── images/         # Static images and assets
├── src/
│   ├── layouts/        # Page layouts
│   │   └── BaseLayout.astro
│   └── pages/          # Pages (file-based routing)
│       └── index.astro
├── astro.config.mjs    # Astro configuration
├── tailwind.config.mjs # Tailwind configuration
└── package.json
```

## Features

- Single-page design with smooth sections
- Responsive design with Tailwind CSS
- Serverless contact form via Astro API + Cranemail SMTP relay
- Team member showcase
- Portfolio/work showcase
- Modern performance optimizations

## Contact Form SMTP Setup

The `/api/contact` endpoint delivers submissions through Cranemail (or any SMTP server)
using Nodemailer. Configure the following environment variables in your deployment
environment (for both `cheeseflow.com` and `cheeseflow.cn`):

- `CRANEMAIL_SMTP_HOST` – SMTP host provided by Cranemail
- `CRANEMAIL_SMTP_PORT` – SMTP port (587 for STARTTLS or 465 for SSL)
- `CRANEMAIL_SMTP_USER` – SMTP username
- `CRANEMAIL_SMTP_PASS` – SMTP password
- `CONTACT_FROM_EMAIL` – Optional “from” address (defaults to `CRANEMAIL_SMTP_USER`)
- `CONTACT_RECIPIENT_EMAIL` – Optional destination mailbox (defaults to `CRANEMAIL_SMTP_USER`)

After setting the variables, restart the Astro server. Form submissions will redirect
back to the originating page with `?contact=success` or `?contact=error` query params.

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

- **Sitemap:** Built at `/sitemap-index.xml` (references `sitemap-0.xml`). Includes all static routes for `/en/` and `/zh/`.
- **RSS:** English blog at `/feed.xml`, Chinese blog at `/feed-zh.xml`. Linked from layout for auto-discovery.
- **Structured data:** Organization, WebSite, Service, and Person JSON-LD on the homepage; Article schema on each blog post.
- **Hreflang:** Alternate `en` / `zh` links in `<head>` for `/en/*` and `/zh/*` pages.

### Submitting to Google Search Console

1. Add the property for `https://cheeseflow.com` (and optionally `https://cheeseflow.cn` if used).
2. Open **Sitemaps** and submit: `https://cheeseflow.com/sitemap-index.xml`.
3. Request indexing for key URLs (e.g. `https://cheeseflow.com/en/`, `https://cheeseflow.com/zh/`) if needed.

## Website

Live site: https://cheeseflow.com
Chinese site: https://cheeseflow.com.cn (redirects to `/zh`)
