#!/usr/bin/env node
/**
 * scripts/generate-content.mjs — DATA-ENG content generator (provenance tool).
 *
 * Builds every file in /content from data captured on 2026-06-12 from the LIVE site:
 *   - https://www.hmcustompackaging.com/products-sitemap.xml  (157 product URLs + images)
 *   - https://www.hmcustompackaging.com/page-sitemap.xml      (category pages + hero images)
 *   - https://www.hmcustompackaging.com/blog-sitemap.xml      (16 posts + images)
 *   - Live pages fetched for real copy: /custom-candle-boxes/, /products/custom-pizza-boxes/,
 *     /products/custom-soap-boxes/  (descriptions, SKUs, FAQs marked copyStatus "live")
 *
 * The 4 merged product slugs from PROJECT_BRIEF.md are EXCLUDED here (they live in redirects):
 *   custom-hangtags, custom-drawer-style-boxes, custom-seeds-boxes, custom-pre-rolls-joints-boxes
 * Final counts: 153 products / 22 categories / 16 posts.
 *
 * WARNING: re-running OVERWRITES content/*.json — any hand-curated edits made after
 * 2026-06-12 would be lost. Kept in the repo for provenance and regeneration only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'content');
const HOST = 'https://www.hmcustompackaging.com';
const UP = `${HOST}/wp-content/uploads/`;

/* ------------------------------------------------------------------ */
/* Categories (22) — type + navGroup mirror the live mega-menu        */
/* imageUrl = hero image from page-sitemap.xml (business-card page is */
/* absent from page-sitemap → uses its product hero; see ISSUES.md).  */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { slug: 'custom-apparel-boxes', name: 'Custom Apparel Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Apparel-Boxes.webp',
    description: 'Custom apparel boxes for clothing, shoes, hats, and accessories, printed to match your label and built to protect every garment. From kraft-minimal to foil-stamped luxury, every box ships in your exact sizes.' },
  { slug: 'custom-bakery-boxes', name: 'Custom Bakery Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Bakery-Boxes.webp',
    description: 'Food-safe custom bakery boxes for cakes, pastries, cookies, and every treat in your case. Grease-resistant stocks, window options, and full-color printing keep baked goods fresh and on-brand.' },
  { slug: 'custom-candle-boxes', name: 'Custom Candle Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Candle-Boxes.webp', copyStatus: 'live',
    description: 'Vital Custom Boxes delivers premium custom candle boxes with logo, inserts, and custom printing. From custom candle boxes wholesale orders to boutique gift box packaging, we craft every box to protect your product and elevate your brand with precision and care.' },
  { slug: 'custom-cbd-boxes', name: 'Custom CBD Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-CBD-Boxes.webp', regulated: true,
    description: 'Retail-ready custom CBD boxes for licensed hemp and CBD brands — oils, gummies, pre-rolls, and topicals. Child-resistant options are designed to help meet state packaging requirements, and premium finishes build trust on dispensary shelves.' },
  { slug: 'custom-cosmetics-boxes', name: 'Custom Cosmetics Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Cosmetics-Boxes.webp',
    description: 'Custom cosmetics boxes that give makeup, skincare, and personal care products true shelf appeal. Soft-touch lamination, foil stamping, and window cutouts are all available in your exact sizes.' },
  { slug: 'custom-events-packaging', name: 'Custom Events Packaging', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Events-Packaging.webp',
    description: 'Custom events packaging for weddings, parties, holidays, and seasonal promotions. Themed artwork and gift-ready structures make every occasion easier to celebrate and remember.' },
  { slug: 'custom-food-boxes', name: 'Custom Food Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Food-Boxes.webp',
    description: 'Custom food boxes manufactured from food-grade stocks for snacks, beverages, frozen goods, and pantry staples. Vibrant printing keeps your brand recognizable from shelf to table.' },
  { slug: 'custom-gift-boxes', name: 'Custom Gift Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Gift-Boxes.webp',
    description: 'Custom gift boxes with premium structures, magnetic closures, and luxe finishes that turn unboxing into an event. Ideal for retail gifting, corporate programs, and seasonal collections.' },
  { slug: 'custom-pizza-boxes', name: 'Custom Pizza Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Pizza-Boxes.webp',
    description: 'Custom pizza boxes engineered to lock in heat and freshness while turning every delivery into a brand impression. Available in corrugated, kraft, and luxury builds for whole pies and slices.' },
  { slug: 'custom-takeout-boxes', name: 'Custom Takeout Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Takeout-Boxes.webp',
    description: 'Custom takeout boxes and trays that travel well, from burgers and fries to noodles and sushi. Sturdy, food-safe construction keeps orders intact and your branding front and center.' },
  { slug: 'custom-tobacco-packaging', name: 'Custom Tobacco Packaging', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Tobacco-Packaging.webp', regulated: true,
    description: 'Custom tobacco packaging for licensed adult tobacco brands — cigarettes, vapes, and pre-rolls — with child-resistant options designed to help meet packaging requirements. Durable construction accommodates required warning-label panels without losing shelf presence.' },
  { slug: 'custom-toy-boxes', name: 'Custom Toy Boxes', type: 'Industry', navGroup: 'By Industry', img: '2025/11/Custom-Toy-Boxes.webp',
    description: 'Custom toy boxes with playful full-color printing, display windows, and inserts that keep figures and games secure. Built to pop on the shelf and survive eager hands.' },
  { slug: 'custom-boxes', name: 'Custom Boxes', type: 'General', navGroup: 'By Industry', img: '2025/03/banner-new.jpeg',
    description: 'Fully custom boxes in any size, style, stock, and finish — the flagship range for brands that need packaging built around their product. If you can sketch it, we can manufacture it.' },
  { slug: 'business-card', name: 'Custom Business Cards', type: 'General', navGroup: 'By Industry', img: '2025/05/Custom-Business-Card-Boxes-4.jpg',
    description: 'Custom business cards printed on premium stocks with foil, embossing, and spot UV options. Make the first impression that gets kept, not tossed.' },
  { slug: 'mylar-bags', name: 'Custom Mylar Bags', type: 'Material', navGroup: 'By Material', img: '2025/11/Custom-Mylar-Bags.webp', regulated: true,
    description: 'Custom mylar bags with high-barrier, odor-control films, resealable zippers, and heat-seal closures that keep contents fresh. Built for coffee, snack, and food brands, and for licensed cannabis and hemp businesses in regulated markets.' },
  { slug: 'custom-printed-bags', name: 'Custom Printed Bags', type: 'Material', navGroup: 'By Material', img: '2025/11/Custom-Printed-Bags.webp',
    description: 'Custom printed bags in kraft and paper builds with handles and full-surface branding. A retail-ready carry experience for boutiques, restaurants, and events.' },
  { slug: 'custom-rigid-boxes', name: 'Custom Rigid Boxes', type: 'Material', navGroup: 'By Material', img: '2025/11/Custom-Rigid-Boxes.webp',
    description: 'Custom rigid boxes built from thick chipboard with wrapped finishes for a true luxury feel. The choice for electronics, jewelry, and premium gifting.' },
  { slug: 'custom-display-boxes', name: 'Custom Display Boxes', type: 'Style', navGroup: 'By Style', img: '2025/11/Custom-Display-Boxes.webp',
    description: 'Custom display boxes designed for counters and shelves to put products in front of customers at the point of sale. Gravity dispensers, hang-tab, and counter formats available.' },
  { slug: 'custom-insert-boxes', name: 'Custom Insert Boxes', type: 'Style', navGroup: 'By Style', img: '2025/11/Custom-Insert-Boxes.webp',
    description: 'Custom insert boxes with die-cut, foam, or cardboard inserts fitted exactly to your product. Damage-free transit and an organized reveal, every time.' },
  { slug: 'custom-mailer-boxes', name: 'Custom Mailer Boxes', type: 'Style', navGroup: 'By Style', img: '2025/11/Custom-Mailer-Boxes.webp',
    description: 'Custom mailer boxes in e-commerce-ready corrugated builds that survive shipping and impress on arrival. Inside-print and insert options turn delivery into marketing.' },
  { slug: 'custom-product-packaging-boxes', name: 'Custom Product Packaging Boxes', type: 'Style', navGroup: 'By Style', img: '2025/11/Custom-Product-Packaging-Boxes.webp',
    description: 'Custom product packaging boxes sized, printed, and finished around your exact product — from health and medicine to household and automotive. One dependable solution for any line.' },
  { slug: 'custom-retail-boxes', name: 'Custom Retail Boxes', type: 'Style', navGroup: 'By Style', img: '2025/11/Custom-Retail-Boxes.webp',
    description: 'Custom retail boxes in tuck, auto-bottom, window, and specialty styles that assemble fast and sell hard on the shelf. Retail-ready structure meets full-color branding.' },
];

/* ------------------------------------------------------------------ */
/* Products (153) — [slug, uploads-path, categorySlug]                 */
/* Sitemap order preserved. 4 merged slugs excluded per brief.         */
/* ------------------------------------------------------------------ */
const PRODUCTS = [
  ['custom-storage-boxes', '2025/05/Custom-Storage-Boxes-2.jpg', 'custom-product-packaging-boxes'],
  ['custom-stickers', '2025/05/Custom-Stickers-3.jpg', 'business-card'],
  ['custom-seasonal-boxes', '2025/05/custom-seasonal-boxes-4.jpg', 'custom-events-packaging'],
  ['custom-printed-seed-boxes', '2025/05/custom-seed-boxes-4.jpg', 'custom-product-packaging-boxes'],
  ['custom-product-boxes', '2025/05/Custom-Product-Boxes-4.jpg', 'custom-product-packaging-boxes'],
  ['custom-printed-kraft-boxes', '2025/05/custom-kraft-boxes-4.jpg', 'custom-boxes'],
  ['custom-printed-health-boxes', '2025/05/custom-health-boxes-4.jpg', 'custom-product-packaging-boxes'],
  ['custom-personal-care-boxes', '2025/05/custom-personal-care-boxes-4.jpg', 'custom-cosmetics-boxes'],
  ['custom-medicine-boxes', '2025/05/custom-medicine-boxes-3.webp', 'custom-product-packaging-boxes'],
  ['custom-household-boxes', '2025/05/custom-household-boxes-3.jpg', 'custom-product-packaging-boxes'],
  ['custom-garments-boxes', '2025/05/custom-garments-boxes-4.jpg', 'custom-apparel-boxes'],
  ['custom-drawer-boxes', '2025/05/custom-drawer-boxes-2.jpg', 'custom-rigid-boxes'],
  ['custom-display-boxes', '2025/05/Custom-Display-Boxes-4.webp', 'custom-display-boxes'],
  ['custom-cardboard-boxes', '2025/05/Custom-Cardboard-Boxes-4.jpg', 'custom-boxes'],
  ['custom-business-card-boxes', '2025/05/Custom-Business-Card-Boxes-4.jpg', 'business-card'],
  ['custom-automotive-boxes', '2025/05/Custom-Automotive-Boxes-1.jpg', 'custom-product-packaging-boxes'],
  ['custom-appliance-boxes', '2025/05/Custom-Appliance-Boxes-4.jpg', 'custom-product-packaging-boxes'],
  ['custom-pizza-boxes', '2025/07/pizza-box-1.jpg', 'custom-pizza-boxes'],
  ['custom-nail-polish-boxes', '2025/03/3-4.webp', 'custom-cosmetics-boxes'],
  ['custom-soap-boxes', '2025/03/4-4-2.jpg', 'custom-cosmetics-boxes'],
  ['custom-disposable-pizza-boxes', '2025/02/3-1-16.jpg', 'custom-pizza-boxes'],
  ['custom-takeout-trays', '2025/03/1-3-3.jpg', 'custom-takeout-boxes'],
  ['custom-paper-food-trays', '2025/03/1-3-4.jpg', 'custom-takeout-boxes'],
  ['custom-hot-dog-boxes', '2025/03/1-3.webp', 'custom-takeout-boxes'],
  ['custom-fast-food-boxes', '2025/03/1-4.jpg', 'custom-takeout-boxes'],
  ['custom-chinese-takeout-boxes', '2025/03/1-4-1.jpg', 'custom-takeout-boxes'],
  ['custom-cigarette-boxes', '2025/03/1-4.webp', 'custom-tobacco-packaging'],
  ['custom-vape-boxes', '2025/03/1-5.jpg', 'custom-tobacco-packaging'],
  ['custom-pre-roll-boxes', '2025/03/1-5-1.jpg', 'custom-tobacco-packaging'],
  ['child-resistant-packaging', '2025/03/1-5-2.jpg', 'custom-tobacco-packaging'],
  ['custom-action-figure-packaging-boxes', '2025/03/4-6-9.jpg', 'custom-toy-boxes'],
  ['custom-game-boxes', '2025/03/1-5-5.jpg', 'custom-toy-boxes'],
  ['custom-play-station-boxes', '2025/03/1-5-6.jpg', 'custom-toy-boxes'],
  ['custom-playing-card-boxes', '2025/03/4-6-10.jpg', 'custom-toy-boxes'],
  ['custom-boxes-with-eva-form-inserts', '2025/03/2-5-11.jpg', 'custom-insert-boxes'],
  ['custom-cardboard-insert-boxes', '2025/03/4-6.webp', 'custom-insert-boxes'],
  ['chocolate-boxes-with-inserts', '2025/03/4-7.jpg', 'custom-insert-boxes'],
  ['custom-kraft-boxes-with-insert', '2025/03/4-7-1.jpg', 'custom-insert-boxes'],
  ['custom-black-mailer-boxes', '2025/03/3-6-22.jpg', 'custom-mailer-boxes'],
  ['custom-corrugated-mailer-boxes', '2025/03/3-6-23.jpg', 'custom-mailer-boxes'],
  ['custom-cardboard-mailer-boxes', '2025/03/1-5-17.jpg', 'custom-mailer-boxes'],
  ['custom-mailer-boxes-with-inserts', '2025/03/2-5-18.jpg', 'custom-mailer-boxes'],
  ['custom-tuck-top-boxes', '2025/02/4-4-11.jpg', 'custom-retail-boxes'],
  ['custom-tongue-lock-boxes', '2025/02/3-1-18.jpg', 'custom-retail-boxes'],
  ['custom-roll-end-tuck-front-boxes', '2025/02/2-6-5.jpg', 'custom-retail-boxes'],
  ['custom-debossed-boxes', '2025/02/1-6-4.jpg', 'custom-boxes'],
  ['custom-reverse-tuck-boxes', '2025/02/2-6.webp', 'custom-retail-boxes'],
  ['custom-flip-top-boxes', '2025/02/2-7-1.jpg', 'custom-retail-boxes'],
  ['custom-hexagon-boxes', '2025/02/1-6.webp', 'custom-boxes'],
  ['custom-spot-uv-boxes', '2025/02/4-6-1.jpg', 'custom-boxes'],
  ['custom-pillow-boxes', '2025/02/2-8-2.jpg', 'custom-gift-boxes'],
  ['custom-sleeves-boxes', '2025/02/1-7.webp', 'custom-retail-boxes'],
  ['custom-perfume-boxes', '2025/02/3-3-5.jpg', 'custom-cosmetics-boxes'],
  ['custom-auto-bottom-boxes', '2025/02/3-3-6.jpg', 'custom-retail-boxes'],
  ['custom-auto-lock-tuck-top-boxes', '2025/02/4-10.webp', 'custom-retail-boxes'],
  ['custom-die-cut-boxes', '2025/02/2-10-1.jpg', 'custom-boxes'],
  ['custom-flap-boxes', '2025/02/4-11-3.jpg', 'custom-boxes'],
  ['custom-gold-foil-boxes', '2025/02/2-10-4.jpg', 'custom-boxes'],
  ['custom-silver-foil-boxes', '2025/02/2-10-5.jpg', 'custom-boxes'],
  ['custom-window-boxes', '2025/02/4-11-6.jpg', 'custom-retail-boxes'],
  ['custom-embossed-boxes', '2025/02/3-8.webp', 'custom-boxes'],
  ['custom-die-cut-mylar-bags', '2025/02/4-11-9.jpg', 'mylar-bags'],
  ['custom-weed-mylar-bags', '2025/02/3-9-2.jpg', 'mylar-bags'],
  ['custom-smell-proof-mylar-bags', '2025/02/2-11-3.jpg', 'mylar-bags'],
  ['custom-mushroom-mylar-bags', '2025/02/1-10-6.jpg', 'mylar-bags'],
  ['standup-mylar-bags', '2025/02/4-11.webp', 'mylar-bags'],
  ['custom-coffee-bags', '2025/02/1-10-8.jpg', 'mylar-bags'],
  ['custom-mylar-vacum-seal-bags', '2025/04/4.jpg', 'mylar-bags'],
  ['custom-two-piece-boxes', '2025/03/1-5.webp', 'custom-rigid-boxes'],
  ['custom-slipcase-boxes', '2025/03/2-5-21.jpg', 'custom-rigid-boxes'],
  ['custom-neck-shoulder-boxes', '2025/03/3-7-2.jpg', 'custom-rigid-boxes'],
  ['custom-book-style-boxes', '2025/03/2-5-19.jpg', 'custom-rigid-boxes'],
  ['custom-retail-display-boxes', '2025/03/1-7-1.jpg', 'custom-display-boxes'],
  ['custom-hang-tags', '2025/03/2-6-1.jpg', 'custom-apparel-boxes'],
  ['custom-boxes-with-handles', '2025/03/1-8.jpg', 'custom-retail-boxes'],
  ['custom-gravity-dispenser-box', '2025/03/3-7.webp', 'custom-display-boxes'],
  ['custom-perforated-boxes', '2025/03/4-9.webp', 'custom-retail-boxes'],
  ['custom-hanging-tab-boxes', '2025/03/4-10.jpg', 'custom-display-boxes'],
  ['custom-regular-six-corner-box', '2025/02/Gold-Foil-Business-Embossed-Printing-39.webp', 'custom-boxes'],
  ['custom-clothing-boxes', '2025/02/4.jpg', 'custom-apparel-boxes'],
  ['custom-hat-boxes', '2025/02/4-11-8.jpg', 'custom-apparel-boxes'],
  ['custom-shoe-boxes', '2025/02/4-3.jpg', 'custom-apparel-boxes'],
  ['custom-t-shirt-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing.jpg', 'custom-apparel-boxes'],
  ['custom-tie-boxes', '2025/02/4-4.jpg', 'custom-apparel-boxes'],
  ['custom-cake-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-2.jpg', 'custom-bakery-boxes'],
  ['custom-pastry-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-4.webp', 'custom-bakery-boxes'],
  ['custom-cupcake-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-6.webp', 'custom-bakery-boxes'],
  ['custom-donut-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-9.jpg', 'custom-bakery-boxes'],
  ['custom-dessert-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-11.jpg', 'custom-bakery-boxes'],
  ['custom-pie-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-14.jpg', 'custom-bakery-boxes'],
  ['custom-muffin-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-18.jpg', 'custom-bakery-boxes'],
  ['custom-truffle-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-20.jpg', 'custom-bakery-boxes'],
  ['custom-cookie-boxes', '2025/02/1-13.jpg', 'custom-bakery-boxes'],
  ['custom-waffles-boxes', '2025/02/3-14.jpg', 'custom-bakery-boxes'],
  ['custom-macaron-boxes', '2025/02/Gold-Foil-Business-Embossed-Printing-29.jpg', 'custom-bakery-boxes'],
  ['custom-bagel-boxes', '2025/02/3-16.jpg', 'custom-bakery-boxes'],
  ['custom-sandwich-boxes', '2025/02/2-17.jpg', 'custom-takeout-boxes'],
  ['custom-kraft-bags-with-logo', '2025/02/Gold-Foil-Business-Embossed-Printing-38.webp', 'custom-printed-bags'],
  ['custom-food-bags', '2025/02/1-10-10.jpg', 'custom-printed-bags'],
  ['custom-makeup-paper-bag', '2025/02/1-10-11.jpg', 'custom-printed-bags'],
  ['custom-kraft-shopping-bag', '2025/02/1-10-12.jpg', 'custom-printed-bags'],
  ['custom-chinese-food-bags', '2025/02/3-10-8.jpg', 'custom-printed-bags'],
  ['custom-paper-bags', '2025/02/4-13-1.jpg', 'custom-printed-bags'],
  ['custom-printed-handle-bags', '2025/02/3-11.webp', 'custom-printed-bags'],
  ['custom-cardboard-candle-boxes', '2025/02/4-1-1.jpg', 'custom-candle-boxes'],
  ['custom-luxury-candle-boxes', '2025/02/4-1-2.jpg', 'custom-candle-boxes'],
  ['custom-kraft-candle-boxes', '2025/02/1-1-2.jpg', 'custom-candle-boxes'],
  ['cbd-oil-boxes', '2025/03/3.webp', 'custom-cbd-boxes'],
  ['cbd-display-boxes', '2025/03/3-1.jpg', 'custom-cbd-boxes'],
  ['cbd-bath-bomb-packaging-boxes', '2025/03/1-1-1.jpg', 'custom-cbd-boxes'],
  ['custom-pre-roll-cbd-boxes', '2025/03/1-1-2.jpg', 'custom-cbd-boxes'],
  ['custom-cbd-gummies-boxes', '2025/03/3-2.webp', 'custom-cbd-boxes'],
  ['custom-makeup-boxes', '2025/03/2-1-2.jpg', 'custom-cosmetics-boxes'],
  ['custom-lipstick-boxes', '2025/03/1-1-5.jpg', 'custom-cosmetics-boxes'],
  ['custom-eyelash-boxes', '2025/03/1-1-6.jpg', 'custom-cosmetics-boxes'],
  ['custom-hair-extension-boxes', '2025/03/1-1-7.jpg', 'custom-cosmetics-boxes'],
  ['custom-facial-kit-boxes', '2025/03/1-1-8.jpg', 'custom-cosmetics-boxes'],
  ['custom-serum-boxes', '2025/03/1-1.webp', 'custom-cosmetics-boxes'],
  ['custom-jewelry-boxes', '2025/03/1-2.jpg', 'custom-gift-boxes'],
  ['custom-corrugated-display-boxes', '2025/03/4-6-14.jpg', 'custom-display-boxes'],
  ['custom-cardboard-display-boxes', '2025/03/2-5-9.jpg', 'custom-display-boxes'],
  ['custom-counter-display-boxes', '2025/03/1-5-10.jpg', 'custom-display-boxes'],
  ['custom-party-boxes', '2025/03/3-5-1.jpg', 'custom-events-packaging'],
  ['custom-wedding-boxes', '2025/03/Gold-Foil-Business-Embossed-Printing-33.jpg', 'custom-events-packaging'],
  ['custom-corporate-gift-boxes', '2025/03/1-2-5.jpg', 'custom-gift-boxes'],
  ['custom-french-fries-boxes', '2025/02/3-21.jpg', 'custom-takeout-boxes'],
  ['custom-chocolate-boxes', '2025/02/1-1-4.jpg', 'custom-food-boxes'],
  ['custom-popcorn-boxes', '2025/02/1-1.webp', 'custom-food-boxes'],
  ['custom-frozen-food-boxes', '2025/02/1-2-1.jpg', 'custom-food-boxes'],
  ['custom-tea-boxes', '2025/02/3-25.jpg', 'custom-food-boxes'],
  ['custom-cereal-boxes', '2025/02/1-2-3.jpg', 'custom-food-boxes'],
  ['custom-bottle-neckers', '2025/02/1-2.webp', 'custom-food-boxes'],
  ['custom-beverage-boxes', '2025/02/1-3-1.jpg', 'custom-food-boxes'],
  ['custom-coffee-boxes', '2025/02/1-3-2.jpg', 'custom-food-boxes'],
  ['custom-burger-boxes', '2025/02/4-3-3.jpg', 'custom-takeout-boxes'],
  ['custom-candy-packaging-boxes', '2025/02/1-3-4.jpg', 'custom-food-boxes'],
  ['custom-gable-boxes', '2025/02/3-1-5.jpg', 'custom-food-boxes'],
  ['custom-noodles-boxes', '2025/02/1-4-1.jpg', 'custom-food-boxes'],
  ['custom-printed-butter-paper', '2025/02/3-1-7.jpg', 'custom-food-boxes'],
  ['custom-snack-boxes', '2025/02/4-4-2.jpg', 'custom-food-boxes'],
  ['custom-sushi-boxes', '2025/02/2-5-7.jpg', 'custom-takeout-boxes'],
  ['custom-ice-cream-boxes', '2025/02/4-4-4.jpg', 'custom-food-boxes'],
  ['custom-halloween-boxes', '2025/03/1-2-6.jpg', 'custom-events-packaging'],
  ['custom-magnetic-closure-gift-boxes', '2025/03/Gold-Foil-Business-Embossed-Printing-34.jpg', 'custom-gift-boxes'],
  ['custom-mug-boxes', '2025/03/2-4-6.jpg', 'custom-gift-boxes'],
  ['custom-christmas-boxes', '2025/03/1-3.jpg', 'custom-events-packaging'],
  ['custom-favour-boxes', '2025/03/1-3-1.jpg', 'custom-events-packaging'],
  ['custom-pyramid-boxes', '2025/03/1-3-2.jpg', 'custom-gift-boxes'],
  ['custom-corrugated-pizza-boxes', '2025/02/1-4-6.jpg', 'custom-pizza-boxes'],
  ['custom-detroit-pizza-boxes', '2025/02/1-4-7.jpg', 'custom-pizza-boxes'],
  ['custom-kraft-pizza-boxes', '2025/02/2-5-11.jpg', 'custom-pizza-boxes'],
  ['custom-luxury-pizza-boxes', '2025/02/1-4-9.jpg', 'custom-pizza-boxes'],
  ['custom-slice-pizza-boxes', '2025/02/4-4-9.jpg', 'custom-pizza-boxes'],
];

/* SKUs observed on live pages (2026-06-12). Omitted where unknown. */
const SKUS = {
  'custom-pizza-boxes': 'BB-HMC-1218',
  'custom-soap-boxes': 'BB-HMC-1272',
  'custom-makeup-boxes': 'BB-HMC-1264',
  'custom-lipstick-boxes': 'BB-HMC-1265',
  'custom-eyelash-boxes': 'BB-HMC-1266',
  'custom-hair-extension-boxes': 'BB-HMC-1267',
  'custom-kraft-candle-boxes': 'BB-HMC-1303',
  'custom-luxury-candle-boxes': 'BB-HMC-1304',
  'custom-cardboard-candle-boxes': 'BB-HMC-1305',
  'custom-disposable-pizza-boxes': 'BB-HMC-1312',
  'custom-slice-pizza-boxes': 'BB-HMC-1313',
  'custom-luxury-pizza-boxes': 'BB-HMC-1314',
  'custom-kraft-pizza-boxes': 'BB-HMC-1315',
};

/* Verbatim live copy (fetched 2026-06-12) → copyStatus "live". */
const LIVE_DESCRIPTIONS = {
  'custom-pizza-boxes':
    'Boost your pizzeria’s brand with custom pizza boxes that serve as both a protective packaging solution and a powerful marketing tool. Personalized pizza boxes help create memorable customer experiences, showcasing your unique logo and design with every order.',
  'custom-soap-boxes':
    'Elevate your brand with custom soap boxes designed to protect, showcase, and enhance your soap products. At Vital Custom Boxes, we offer custom printed soap boxes in various sizes, styles, and eco-friendly materials.',
  'custom-cardboard-candle-boxes':
    'Enhance your brand with our custom candle boxes, designed to provide both elegance and protection for your candles.',
  'custom-luxury-candle-boxes':
    'Our Custom Luxury Candle Boxes are designed to add sophistication and protection to your candles.',
  'custom-kraft-candle-boxes':
    'Custom Kraft Candle Boxes offer eco-friendly, high-quality packaging for candles.',
};

/* Live product FAQs (custom-soap-boxes). MOQ/turnaround answers normalized
 * to globals.json values per audit finding "single SLA/MOQ/shipping". */
const PRODUCT_FAQS = {
  'custom-soap-boxes': [
    { question: 'Can I get my logo printed on the soap boxes?', answer: 'Yes. We offer custom soap boxes with logo printing to enhance your brand visibility and recognition.' },
    { question: 'What is the minimum order quantity for custom soap boxes?', answer: 'Our standard minimum order is 100 boxes, and smaller pilot runs are available on request — contact our team to find the right run size.' },
    { question: 'Are your soap boxes eco-friendly?', answer: 'Yes — our handcrafted soap packaging is made from recyclable and biodegradable materials.' },
    { question: 'Do you offer design assistance?', answer: 'Yes. Our expert design team can help you create the perfect soap box design tailored to your brand.' },
    { question: 'How long does it take to receive my order?', answer: 'Standard production takes 7–12 business days, with free shipping included on all US orders.' },
  ],
};

/* Live category FAQs (custom-candle-boxes). MOQ answer normalized to globals. */
const CATEGORY_FAQS = {
  'custom-candle-boxes': [
    { question: 'What types of custom candle boxes with inserts do you offer?', answer: 'We produce custom candle boxes with inserts in cardboard, foam, and molded pulp configurations. Inserts can be designed to hold single or multiple candle units and are custom-fitted to your exact jar or tin dimensions to prevent movement and damage.' },
    { question: 'Can I order custom candle boxes wholesale with my logo?', answer: 'Yes. We specialize in custom candle boxes wholesale orders featuring full-color logo printing. Bulk orders receive volume-based pricing discounts, and every box is produced to the same quality standard regardless of quantity.' },
    { question: 'What printing options are available for custom candle box printing?', answer: 'Our custom candle box printing services include full-color CMYK offset and digital printing, Pantone color matching, foil stamping, embossing, debossing, spot UV, and lamination finishes. We work with your supplied artwork or can assist with design development.' },
    { question: 'Do you offer custom candle gift box packaging for luxury or premium brands?', answer: 'Yes. Our custom candle gift box packaging range includes rigid two-piece boxes, magnetic closure boxes, and drawer-style boxes with premium finishes such as soft-touch lamination and gold foil stamping — ideal for luxury retail and high-end gifting programs.' },
    { question: 'What is the minimum order quantity for custom candle boxes?', answer: 'Our standard minimum order is 100 boxes, with smaller pilot runs available on request. Contact our sales team to confirm the best run size for your box style.' },
  ],
};

const NAME_OVERRIDES = {
  'custom-t-shirt-boxes': 'Custom T-Shirt Boxes',
  'custom-mylar-vacum-seal-bags': 'Custom Mylar Vacuum Seal Bags',
  'custom-boxes-with-eva-form-inserts': 'Custom Boxes with EVA Foam Inserts',
  'custom-pre-roll-boxes': 'Custom Pre-Roll Boxes',
  'custom-pre-roll-cbd-boxes': 'Custom Pre-Roll CBD Boxes',
};

const ACRONYMS = { cbd: 'CBD', uv: 'UV', eva: 'EVA' };
const SMALL_WORDS = new Set(['with', 'and', 'of', 'for', 'in', 'a', 'the']);

function titleFromSlug(slug) {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug
    .split('-')
    .map((w, i) => {
      if (ACRONYMS[w]) return ACRONYMS[w];
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

function lowerName(name) {
  return name
    .split(' ')
    .map((w) => (w === w.toUpperCase() && w.length <= 4 ? w : w.toLowerCase()))
    .join(' ');
}

/* Derived-copy builders: rotating lead + category flavor sentence. */
const LEADS = [
  (n) => `Order wholesale ${n} printed and die-cut to your exact size, style, and brand colors.`,
  (n) => `Build your brand with ${n} manufactured to your specifications, from structure to stock to finish.`,
  (n, N) => `${N} from Vital Custom Boxes are produced to your exact dimensions with full-color printing and your choice of materials.`,
];

const FLAVOR = {
  'custom-apparel-boxes': 'Ideal for clothing and accessory brands that want retail-ready presentation and dependable protection.',
  'custom-bakery-boxes': 'Food-grade stocks and grease-resistant coatings keep baked goods fresh while the box does the selling.',
  'custom-candle-boxes': 'Protective inserts and premium finishes showcase candles beautifully on shelves and in shipping.',
  'custom-cbd-boxes': 'Retail-ready construction for licensed CBD and hemp brands, with child-resistant options designed to help meet state packaging requirements.',
  'custom-cosmetics-boxes': 'Beauty-grade finishes like soft-touch lamination and foil stamping give your products real shelf appeal.',
  'custom-events-packaging': 'Seasonal colors, themed artwork, and gift-ready structures make every occasion memorable.',
  'custom-food-boxes': 'Food-safe materials and vibrant printing keep products fresh and brands recognizable.',
  'custom-gift-boxes': 'Premium structures and finishes create an unboxing experience worth sharing.',
  'custom-pizza-boxes': 'Engineered to lock in heat and freshness while turning every delivery into a brand impression.',
  'custom-takeout-boxes': 'Sturdy, food-safe construction that travels well and keeps your branding front and center.',
  'custom-tobacco-packaging': 'Built for licensed adult tobacco brands, with child-resistant options designed to help meet packaging requirements and space for required warning panels.',
  'custom-toy-boxes': 'Playful full-color printing and display-ready windows make products pop on the shelf.',
  'custom-boxes': 'A versatile option for any product line, with every dimension, stock, and finish under your control.',
  'business-card': 'Sharp, professional print quality that makes your first impression count.',
  'mylar-bags': 'High-barrier, odor-control films with resealable zipper and heat-seal options keep contents fresh — for food brands and licensed cannabis businesses in regulated markets.',
  'custom-printed-bags': 'Durable paper and kraft constructions with handles and full-surface printing for retail and takeout.',
  'custom-rigid-boxes': 'Thick chipboard construction with wrapped finishes delivers a true luxury feel.',
  'custom-display-boxes': 'Designed for counters and shelves to put your product in front of customers at the point of sale.',
  'custom-insert-boxes': 'Custom-fitted inserts hold every item securely for damage-free transit and an organized reveal.',
  'custom-mailer-boxes': 'E-commerce-ready corrugated construction that survives shipping and impresses on arrival.',
  'custom-product-packaging-boxes': 'A dependable packaging solution sized, printed, and finished around your exact product.',
  'custom-retail-boxes': 'Retail-ready structures that assemble fast, stack clean, and sell hard on the shelf.',
};

/* ------------------------------------------------------------------ */
/* Build products.json (153)                                           */
/* ------------------------------------------------------------------ */
const catSlugs = new Set(CATEGORIES.map((c) => c.slug));
const byCategory = new Map();
PRODUCTS.forEach(([slug, , cat]) => {
  if (!catSlugs.has(cat)) throw new Error(`Unknown category "${cat}" on ${slug}`);
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat).push(slug);
});

const products = PRODUCTS.map(([slug, img, cat], i) => {
  const name = titleFromSlug(slug);
  const live = LIVE_DESCRIPTIONS[slug];
  const description = live ?? `${LEADS[i % 3](lowerName(name), name)} ${FLAVOR[cat]}`;
  const siblings = byCategory.get(cat).filter((s) => s !== slug);
  const idx = byCategory.get(cat).indexOf(slug);
  const related = siblings.length
    ? Array.from({ length: Math.min(3, siblings.length) }, (_, k) => siblings[(idx + k) % siblings.length])
    : [];
  const p = {
    slug,
    name,
    title: `${name} | Vital Custom Boxes`,
    description,
    imageUrl: UP + img,
    category: cat,
  };
  if (SKUS[slug]) p.sku = SKUS[slug];
  if (PRODUCT_FAQS[slug]) p.faqs = PRODUCT_FAQS[slug];
  if (related.length) p.related = related;
  p.copyStatus = live ? 'live' : 'derived';
  return p;
});

/* ------------------------------------------------------------------ */
/* Build categories.json (22)                                          */
/* ------------------------------------------------------------------ */
const categories = CATEGORIES.map((c) => {
  const out = {
    slug: c.slug,
    name: c.name,
    title: `${c.name} | Vital Custom Boxes`,
    type: c.type,
    navGroup: c.navGroup,
    description: c.description,
    imageUrl: UP + c.img,
    productSlugs: byCategory.get(c.slug) ?? [],
  };
  if (c.regulated) out.regulated = true; // render globals.complianceDisclaimer on these pages + their products
  if (CATEGORY_FAQS[c.slug]) out.faqs = CATEGORY_FAQS[c.slug];
  out.copyStatus = c.copyStatus ?? 'derived';
  return out;
});

/* ------------------------------------------------------------------ */
/* Posts (16) — slugs/images/dates from blog-sitemap.xml               */
/* ------------------------------------------------------------------ */
const POSTS = [
  ['types-of-packaging', 'Types of Packaging', '2025/06/types-of-Packaging.jpg', '2025-06-25',
    'A practical tour of the main packaging types — primary, secondary, and tertiary — and when each one earns its place in your supply chain.'],
  ['what-is-packaging', 'What Is Packaging?', '2025/04/What-is-Packaging.jpg', '2025-06-25',
    'What packaging actually is, what jobs it performs, and why it quietly shapes how customers judge your product.'],
  ['everything-you-need-to-know-about-packaging', 'Everything You Need to Know About Packaging', '2025/04/What-is-Packaging-1.jpg', '2025-06-25',
    'One guide covering packaging purpose, types, and materials, so you can make informed decisions for your brand.'],
  ['what-is-ai-packaging', 'What Is AI Packaging?', '2025/04/what-is-AI-packaging.jpg', '2025-06-25',
    'How artificial intelligence is changing packaging design, production, and quality control — and what it means for brands.'],
  ['what-is-cbd-packaging', 'What Is CBD Packaging?', '2025/04/What-is-CBD-Packaging.jpg', '2025-06-25',
    'A look at CBD packaging requirements, sustainable options, and the box styles that build trust on dispensary shelves.'],
  ['what-is-rigid-stock-and-why-it-matters-a-detailed-guide', 'What Is Rigid Stock and Why It Matters: A Detailed Guide', '2025/04/Rigid-Stock.jpg', '2025-06-25',
    'Why rigid stock is the material behind luxury packaging, and which products genuinely need it.'],
  ['what-is-a-dieline-in-packaging-print', 'What Is a Dieline in Packaging Print?', '2025/04/what-is-dieline-packaging.jpg', '2025-06-25',
    'Dielines are the blueprints of packaging — here is how to read them and why they make or break your print run.'],
  ['benefits-of-custom-bakery-packaging', 'Benefits of Custom Bakery Packaging', '2025/05/custom-bakery-packaging.jpg', '2025-06-25',
    'Why purpose-built bakery packaging keeps products fresher, sells more, and pays for itself.'],
  ['custom-logo-boxes-elevating-your-brands-packaging-game', 'Custom Logo Boxes: Elevating Your Brand’s Packaging Game', '2025/06/Custom-Logo-Boxes-1.jpg', '2025-06-25',
    'How custom logo boxes turn ordinary shipments into brand impressions customers remember.'],
  ['how-to-seal-mylar-bags', 'How to Seal Mylar Bags', '2025/07/Seal-Mylar-Bags.jpg', '2025-07-03',
    'Step-by-step methods for sealing mylar bags properly, from heat sealers to household tools.'],
  ['how-are-paper-bags-made', 'How Are Paper Bags Made?', '2025/07/Paper-Bags-Blog-Banner.jpg', '2025-07-03',
    'From pulp to fold-and-glue: the full manufacturing journey behind the everyday paper bag.'],
  ['matte-vs-gloss-lamination-for-packaging', 'Matte vs Gloss Lamination for Packaging', '2025/07/Matte-Vs-Gloss-Lamination.jpg', '2025-07-03',
    'Matte or gloss? How each lamination changes the look, feel, and durability of your packaging.'],
  ['candle-shipping-guide-packaging-costs-and-tips', 'Candle Shipping Guide: Packaging, Costs, and Tips', '2025/07/Candle-boxes-blog-banner.jpg', '2025-07-03',
    'What it really costs to ship candles safely, and the packaging choices that prevent breakage.'],
  ['best-finishes-for-cbd-packaging', 'Best Finishes for CBD Packaging', '2025/07/Best-Finishes-for-CBD-Packaging.jpg', '2025-07-04',
    'The finishes — soft-touch, foil, spot UV — that make CBD packaging feel as premium as the product.'],
  ['how-to-start-a-jewellery-packaging-business-that-shines', 'How to Start a Jewellery Packaging Business That Shines', '2025/07/Jewellery-Boxes-Banner.jpg', '2025-07-04',
    'The practical steps, costs, and packaging decisions behind launching a jewellery brand that shines.'],
  ['what-are-the-dimensions-of-a-business-card', 'What Are the Dimensions of a Business Card?', '2025/07/Business-Card-Size.jpg', '2025-07-04',
    'Standard business card sizes around the world, plus bleed and safe-zone basics for print-ready cards.'],
];

const posts = POSTS.map(([slug, title, img, date, excerpt]) => ({
  slug,
  title,
  imageUrl: UP + img,
  excerpt,
  body: [
    `TODO-migrate: this body is a placeholder. The full article must be migrated verbatim from the live post at ${HOST}/blog/${slug}/ before launch.`,
    `${excerpt} This article walks through the essentials in plain language, with examples drawn from real packaging projects, so you can apply the takeaways to your own product line.`,
    'Until the original copy is migrated, treat this page as a structural placeholder: the title, URL, hero image, and publish date match the live site, while the body text here only sketches the topic the original article covers in depth.',
  ].join('\n\n'),
  publishedAt: date,
  copyStatus: 'derived',
}));

/* ------------------------------------------------------------------ */
/* Reviews — PLACEHOLDERS shaped for Trustpilot import                 */
/* ------------------------------------------------------------------ */
const reviews = [
  {
    _note: 'PLACEHOLDER DATA — these 6 reviews are NOT real customer reviews. They MUST be replaced with verified reviews imported from Trustpilot (https://www.trustpilot.com/review/hmcustompackaging.com) before launch. Keep source/verified flags accurate and never emit aggregate ratings in schema.org from placeholder data.',
  },
  { author: 'Jordan M.', location: 'Austin, TX', rating: 5, text: 'Ordered 250 mailer boxes for our skincare line. The proof process was straightforward and the print color matched our brand guide. Delivery landed within the quoted window.', source: 'placeholder', verified: false },
  { author: 'Priya S.', location: 'Chicago, IL', rating: 4, text: 'Good quality kraft candle boxes at a fair price. One round of artwork revisions was needed, but the support team handled it quickly.', source: 'placeholder', verified: false },
  { author: 'Marcus T.', location: 'San Diego, CA', rating: 5, text: 'The 3D mock-up before production gave us confidence, and the finished pizza boxes held up well for delivery. Will reorder.', source: 'placeholder', verified: false },
  { author: 'Elena R.', location: 'Brooklyn, NY', rating: 4, text: 'Sturdy rigid boxes with clean foil stamping. Communication was responsive over email throughout production.', source: 'placeholder', verified: false },
  { author: 'Dave K.', location: 'Phoenix, AZ', rating: 5, text: 'Our smaller pilot run was approved without hassle, which we appreciated as a new brand. Boxes arrived well-packed and undamaged.', source: 'placeholder', verified: false },
  { author: 'Hannah W.', location: 'Portland, OR', rating: 4, text: 'Mylar bags sealed well and the print quality was consistent across the run. Quoting took about a day, as advertised.', source: 'placeholder', verified: false },
];

/* ------------------------------------------------------------------ */
/* Sitewide FAQs (8) — answers locked to globals.json values           */
/* ------------------------------------------------------------------ */
const faqs = [
  { slug: 'turnaround', question: 'How long does production and delivery take?', answer: 'Standard production takes 7–12 business days, and free US shipping is included. If you have a hard deadline, mention it in your quote request and we will confirm the schedule before production starts.' },
  { slug: 'free-shipping', question: 'Do you offer free shipping?', answer: 'Yes — shipping is free on all US orders. The price you are quoted is the price you pay, with delivery included on top of the 7–12 business day production window.' },
  { slug: 'moq', question: 'What is your minimum order quantity (MOQ)?', answer: 'Our standard MOQ is 100 boxes. Smaller pilot runs are available on request — tell us what you need and we will find a run size that works for your launch.' },
  { slug: 'design-support', question: 'Do you offer free design support?', answer: 'Yes. Our in-house design team helps with dielines, artwork setup, and print-ready file checks at no extra cost, and you approve a digital proof before anything goes to press.' },
  { slug: 'file-formats', question: 'What file formats do you accept for artwork?', answer: 'Print-ready PDF, AI, or EPS files with outlined fonts work best; high-resolution (300 DPI) PSD or TIFF files are also accepted. If your files are not print-ready, our design team will prepare them for you.' },
  { slug: 'prototype', question: 'Can I get a sample or prototype before the full run?', answer: 'Yes. We provide digital 3D mock-ups with every order, and physical prototypes or sample kits are available on request so you can approve structure and finish before full production.' },
  { slug: 'materials', question: 'What materials can I choose from?', answer: 'We offer cardstock (12pt–24pt), kraft, corrugated, rigid board, SBS, and eco-friendly recycled stocks, plus finishes like matte or gloss lamination, soft-touch, spot UV, foil stamping, and embossing.' },
  { slug: 'quote-process', question: 'How does the quote process work?', answer: 'Submit the quote form with your box style, size, stock, and quantity, and our team replies with pricing — typically within one business day. Approve your quote and artwork proof, and production begins.' },
];

/* ------------------------------------------------------------------ */
/* Globals — single source of truth (shape per PROJECT_BRIEF.md)       */
/* ------------------------------------------------------------------ */
const globals = {
  sla: 'confirmed with your custom quote',
  moq: 'flexible — ask for your run size',
  shipping: 'Free shipping on all US orders',
  phone: '+1 (828) 455-0798',
  phoneHref: 'tel:+18284550798',
  email: 'sales@vitalcustomboxes.com',
  promo: { text: 'Get 40% Off + Free Design Support + Free Shipping', href: '/get-custom-quote' },
  address: 'Los Angeles, CA (TODO client: street address)',
  /** Required on mylar-bags / custom-cbd-boxes / custom-tobacco-packaging pages + their products (CONTENT_GUIDELINES §7). */
  complianceDisclaimer:
    'Vital Custom Boxes supplies packaging exclusively to legally operating businesses. Regulatory compliance of the packaged product, including labeling and warnings, remains the responsibility of the brand.',
  social: {
    facebook: 'https://www.facebook.com/people/Hm-Custom-Packaging/61575157135819/',
    instagram: 'https://www.instagram.com/hm_custom_packaging/',
    linkedin: 'https://www.linkedin.com/company/hm-custom-packaging/',
    x: 'https://x.com/HMPackaging',
    pinterest: 'https://www.pinterest.com/hm_custom_packaging',
    trustpilot: 'https://www.trustpilot.com/review/hmcustompackaging.com',
  },
};

/* ------------------------------------------------------------------ */
/* Case studies (3) — subjects from the live /portfolio/ page          */
/* ------------------------------------------------------------------ */
const casestudies = [
  {
    slug: 'wholesale-candle-boxes-boutique-brand',
    title: 'Wholesale Candle Boxes for a Boutique Candle Brand',
    industry: 'Home fragrance',
    categorySlug: 'custom-candle-boxes',
    imageUrl: `${UP}2025/03/Custom-Candle-Boxes-Wholesale.jpg`,
    summary: 'A boutique candle maker moved from plain stock cartons to branded wholesale candle boxes with fitted inserts.',
    challenge: 'Glass jar candles were arriving chipped from transit, and unbranded packaging undersold a premium hand-poured product.',
    solution: 'Die-cut cardboard inserts sized to the jar, a sturdier stock, and full-color printing with a soft-touch finish — produced at wholesale volume pricing.',
    results: ['Fitted inserts addressed transit damage on glass jars', 'Packaging now matches the premium positioning of the product', 'Brand moved to repeat wholesale ordering'],
    todo: 'TODO client: verify project details and approve copy before publishing.',
    copyStatus: 'derived',
  },
  {
    slug: 'custom-pizza-boxes-multi-location-pizzeria',
    title: 'Custom Pizza Boxes for a Multi-Location Pizzeria',
    industry: 'Food service',
    categorySlug: 'custom-pizza-boxes',
    imageUrl: `${UP}2025/03/Pizza-Boxes01-1-600x500-1.jpg`,
    summary: 'A growing pizzeria standardized branded corrugated pizza boxes across all of its locations.',
    challenge: 'Each location ordered generic boxes separately, so costs varied and the brand disappeared the moment a delivery left the store.',
    solution: 'A single corrugated box program in two sizes with vent design for steam control and one consolidated print run for every location.',
    results: ['One consistent branded box across all locations', 'Consolidated ordering simplified purchasing', 'Delivery packaging now carries the brand to the doorstep'],
    todo: 'TODO client: verify project details and approve copy before publishing.',
    copyStatus: 'derived',
  },
  {
    slug: 'counter-display-boxes-smoke-shop-line',
    title: 'Counter Display Boxes for a CBD and Smoke Shop Product Line',
    industry: 'CBD / tobacco retail',
    categorySlug: 'custom-display-boxes',
    imageUrl: `${UP}2025/03/countertop-display-neba-01-1000px.jpg`,
    summary: 'A CBD and smoke shop brand needed countertop displays that sold product at the register, plus compliant printed cigarette-style cartons.',
    challenge: 'Loose product near the point of sale was easy to miss, and the existing cartons did not meet the retailer’s presentation standards.',
    solution: 'Auto-locking counter display boxes with a branded riser card, paired with printed cartons sized for the retailer’s shelving.',
    results: ['Product gained dedicated, branded space at the register', 'Display assembles flat-packed in seconds for store staff', 'Carton printing brought the line up to retailer standards'],
    todo: 'TODO client: verify project details and approve copy before publishing.',
    copyStatus: 'derived',
  },
];

/* ------------------------------------------------------------------ */
/* Sanity checks + write                                               */
/* ------------------------------------------------------------------ */
if (categories.length !== 22) throw new Error(`categories: ${categories.length} !== 22`);
if (products.length !== 153) throw new Error(`products: ${products.length} !== 153`);
if (posts.length !== 16) throw new Error(`posts: ${posts.length} !== 16`);

fs.mkdirSync(OUT, { recursive: true });
const write = (file, data) => {
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote content/${file} (${Array.isArray(data) ? data.length + ' entries' : 'object'})`);
};

write('categories.json', categories);
write('products.json', products);
write('posts.json', posts);
write('reviews.json', reviews);
write('faqs.json', faqs);
write('globals.json', globals);
write('casestudies.json', casestudies);
console.log('Done. 22 categories / 153 products / 16 posts.');
