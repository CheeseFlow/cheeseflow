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

## Website

Live site: https://cheeseflow.com
