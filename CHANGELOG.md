# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- 404 error page (`src/pages/404.astro`) with bilingual support (English/Chinese)
- Automatic language detection for 404 page based on hostname and pathname
- 404 page with consistent design matching site aesthetic and navigation links
- Blog cover images using Astro's Image component with automatic optimization
- Image import system using `import.meta.glob` for blog cover images
- Helper function to resolve cover image paths from frontmatter to imported assets
- Cloudflare Pages Functions middleware for automatic domain-based routing
- Wrangler configuration for Cloudflare Pages deployment
- Automatic redirects: `.com.cn` and `.cn` domains → `/zh`, all others → `/en`
- Deployment script (`pnpm run deploy`) for Cloudflare Pages production
- Complete Astro site rebuild from scratch
- Typing hero animation component with rotating text
- Service sections: Brand Look, Brand Personality, Brand Influence
- Case studies: Boton, Yadea, Muzen Audio, Mead Johnson, Yeelight, Kranio
- Client logo showcase section
- Contact form section
- Team section with dark background
- Blog index page
- Footer with social links and navigation
- Adobe Typekit font integration (brandon-grotesque, neue-haas-unica, noto-sans-sc)
- Custom color palette (ink: #1A1A1A, brand: #f8d117, grey: #dadada)
- Responsive design with Tailwind CSS
- Dynamic copyright year
- Multilingual support with English (`/en`) and Chinese (`/zh`) language versions
- Chinese header component (`HeaderZh.astro`) with translated navigation
- Chinese footer component (`FooterZh.astro`) with WeChat QR code
- Chinese base layout (`BaseLayoutZh.astro`) with global Chinese font styling
- Chinese post layout (`PostLayoutZh.astro`) for blog posts
- Root redirect from `/` to `/en` by default
- WeChat QR code image in Chinese footer (right-aligned with rounded corners)
- Chinese client logo image variant
- Serverless contact endpoint (`/api/contact`) that sends mail via Cranemail SMTP
- WordPress-to-markdown import script (`convert-wordpress.js`) that downloads original assets per language and emits the new blog frontmatter shape
- Full Chinese (zh) blog content set imported from the 2025‑11‑28 WordPress export, including localized markdown and `/images/blog/zh/` assets

### Changed
- Migrated from Jekyll to Astro
- Removed all Jekyll-related files and configurations
- Updated all case studies to use consistent layout and styling
- Improved footer layout and alignment
- Updated "Improve your brand" link to point to /blog
- Refactored header and footer into reusable components
- Moved "Let's create delight with your brand" contact section to footer component
- Reorganized page structure: moved all pages to `/pages/en/` and duplicated to `/pages/zh/`
- Updated all Chinese pages to use Chinese components and layouts
- Applied Chinese font (`font-chinese`) globally via `BaseLayoutZh` instead of per-element
- Chinese contact form now uses single "名字" (name) field instead of first/last name
- All Chinese copy updated to match cheeseflow.cn website content
- Locale switcher now toggles between cheeseflow.com (EN) and cheeseflow.cn (ZH)
- English & Chinese contact forms now post to in-house Astro API instead of Formspree
- Blog content reorganised into `src/content/blog/en` & `src/content/blog/zh`, each entry carrying `lang`/`translated` metadata and per-locale cover paths
- EN/ZH blog listing & slug routes now filter by language, and Chinese layouts/headings use `font-black` to match typographic guidelines
- All legacy `/images/blog/*.jpg` references updated to `/images/blog/<lang>/…` with original-resolution assets mirrored under both `src/assets` and `public`
- Blog markdown images now use relative paths (`../../assets/images/blog/...`) instead of absolute paths
- Cover images removed from individual blog post pages (only displayed in blog index pages)
- Cover images in blog indexes now use Astro's Image component for automatic optimization and processing
- Language detection now derives from file paths (`en/` or `zh/` subdirectories) instead of requiring `lang` in frontmatter
- Package manager switched from `npm` to `pnpm`
- Output mode set to `static` for Cloudflare Pages compatibility
- Domain-based routing now handled automatically via Cloudflare Pages Functions (no manual Transform Rules needed)
- Removed static `index.astro` to prevent conflicts with Cloudflare Pages Function middleware
- Middleware now intercepts all root path requests before static files are served
- Blog post URLs now use flat structure at root level (e.g., `/post-slug` instead of `/blog/post-slug`)
- All internal links updated to use flat URLs without `/en` or `/zh` prefixes
- Middleware simplified to show language prefixes in URLs (`/en/blog`, `/zh/blog`) for better maintainability
- All internal links updated to include language prefixes (`/en/`, `/zh/`)
- Blog post links now use format `/en/post-slug` and `/zh/post-slug` instead of flat `/post-slug`
- Middleware enforces domain-language pairing: `.com/zh/*` redirects to `.cn/zh/*`, `.cn/en/*` redirects to `.com/en/*`
- Root path (`/`) redirects to appropriate language home (`/en/` or `/zh/`) based on domain
- Header and Footer components updated with language-prefixed links
- Blog pagination links updated to include language prefixes

### Fixed
- **CRITICAL FIX**: Fixed production redirect loop by converting to pure static build
  - Removed Cloudflare adapter (not needed for static output)
  - Moved Astro middleware to Cloudflare Pages Function (`functions/_middleware.ts`)
  - Moved API route to Cloudflare Pages Function (`functions/api/contact.ts`)
  - ZH index.html now properly generates as full page (31KB) instead of redirect HTML (363 bytes)
  - All routing logic runs as Cloudflare Pages Functions compatible with static builds
- **CRITICAL FIX**: Restructured content collections to use separate `blog-en` and `blog-zh` collections instead of subdirectories
  - Moved `src/content/blog/en/` → `src/content/blog-en/`
  - Moved `src/content/blog/zh/` → `src/content/blog-zh/`
  - All 12 EN posts and 12 ZH posts now correctly detected and prerendered
- **CRITICAL FIX**: Corrected `output: 'server'` to `output: 'static'` in astro.config.mjs
  - Images now use simple static URLs (`/_astro/filename.hash.webp`) instead of complex dynamic URLs (`/_image?href=...`)
  - Matches jenxi.com implementation with clean, cacheable image URLs
  - Proper static site generation for Cloudflare Pages deployment
- Fixed middleware blocking `/_image` endpoint in dev mode
  - Added `pathname.startsWith('/_image')` to middleware skip list
  - Dev server now properly serves image transformations during development
- Fixed Sharp image processing warning by configuring `imageService: 'compile'` in astro.config.mjs for Cloudflare compatibility
- Fixed image paths in markdown files after directory restructure (3 levels to 2 levels up)
- Both EN and ZH blog images now render correctly with proper optimization
- Removed debug console.log statements from blog index pages
- Fixed blog post URLs to consistently use language prefixes across all pages
- Installed Sharp as dependency for image processing during build

### Removed
- All Jekyll files and dependencies
- Old WordPress/Jekyll content and layouts
- Legacy asset files
- Root-level blog directory (moved to language-specific directories)
- Image copy script (`scripts/copy-blog-images.js`) - images now loaded directly from `src/assets`
- Rehype/remark plugins for image path transformation - using relative paths in markdown instead
- `lang` field requirement from blog post frontmatter (now derived from file path)
- Cover image rendering from individual blog post layouts
- Astro middleware (replaced with Cloudflare Pages Functions for edge-based routing)
- Static root `index.astro` file (replaced with Cloudflare Pages Function middleware for domain-based routing)
- Blog post routes moved from `/en/blog/[slug].astro` and `/zh/blog/[slug].astro` to root-level `/en/[slug].astro` and `/zh/[slug].astro` for flat URLs
- WordPress conversion script (`convert-wordpress.js`) and temporary build artifacts
- Cloudflare adapter dependency (not needed for pure static builds)

