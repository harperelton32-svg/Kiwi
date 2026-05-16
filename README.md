# KIWI - Premium Mobile-First Fashion Ecommerce

KIWI is a premium mobile-first fashion ecommerce website built with Next.js for fast performance and luxury styling. This project emphasizes performance, mobile optimization, and clean luxury UI.

## Features

- **Mobile-First Design**: Optimized for mobile devices with perfect responsiveness
- **Fast Loading**: Lightweight code, lazy-loaded images, and optimized performance
- **Clean UI**: Modern fashion aesthetic with white background, black typography, and gray accents
- **Smooth Interactions**: Minimal animations using Framer Motion
- **SEO Optimized**: Production-ready with accessibility features
- **Component-Based**: Modular, reusable React components

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Typography**: Google Fonts (Outfit)
- **Animations**: Framer Motion (minimal usage)
- **Language**: TypeScript
- **Deployment**: Cloudflare Pages with OpenNext

## Pages

- Home: Hero banner and featured products
- Shop: All products grid
- Product: Individual product page
- About: Company information
- Contact: Contact form and details

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Cloudflare

This project is optimized for Cloudflare Pages using `@opennextjs/cloudflare`.

### Build & Deploy

To build and deploy manually:

```bash
npm run deploy
```

### Automated Deployment (CI/CD)

When connecting to Cloudflare Pages, use the following settings:
- **Build command**: `npm run build`
- **Build output directory**: `.open-next/assets` (or as configured in wrangler.jsonc)
- **Environment Variable**: `NODE_VERSION` should be `20` or higher.

### Local Preview

To preview the production build locally:

```bash
npm run preview
```

## Performance Optimizations

- Mobile-first responsive design
- Lazy loading for all images using Next.js Image
- Minimal JavaScript bundle
- Server components where possible
- Optimized fonts and CSS
