# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
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

### Removed
- All Jekyll files and dependencies
- Old WordPress/Jekyll content and layouts
- Legacy asset files
- Root-level blog directory (moved to language-specific directories)

