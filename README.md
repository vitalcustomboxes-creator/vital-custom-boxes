# Vital Custom Boxes

Website: https://www.vitalcustomboxes.com

Built with Next.js 15 App Router, React 19, TypeScript,
Tailwind CSS 3.4 and Node.js 22.x.

## Setup

1. Run npm ci.
2. Configure environment variables using .env.example.
3. Run npm run dev.

## Content and storage

- Local JSON supplies categories, blog posts and fallback products.
- Firebase Auth protects the admin portal.
- Firestore stores CMS products and customer submissions.
- Publishing saves the product catalog to Cloudflare R2.
- Product images use /api/product-images/.
- Quote, contact and sample forms save submissions in Firestore.
- Resend sends email notifications.

## Catalog caching

The public catalog uses the tagged Next.js Data Cache.
Publishing writes the updated R2 snapshot before invalidating
the public-products tag.

React cache deduplicates reads within a server render.
Multi-instance self-hosting requires shared cache infrastructure.

## Checks

npm run typecheck
npm run lint
npm test
node scripts/validate-content.mjs
npm run build

## Historical documentation

Older migration reports reference HM Custom Packaging as the
original source website. Those source URLs are historical;
the current website is Vital Custom Boxes.