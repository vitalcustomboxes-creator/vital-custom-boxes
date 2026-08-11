import { getCategories, getPosts } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-products";
import { categoryPath, productPath } from "@/lib/routes";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 60;

const FEATURED_CATEGORY_SLUGS = [
  "custom-bakery-boxes",
  "custom-cosmetics-boxes",
  "custom-rigid-boxes",
  "custom-mailer-boxes",
  "custom-food-boxes",
  "custom-cbd-boxes",
  "mylar-bags",
  "custom-gift-boxes",
];

const FEATURED_PRODUCT_SLUGS = [
  "custom-cake-boxes",
  "custom-nail-polish-boxes",
  "custom-rigid-boxes",
  "custom-mailer-boxes",
  "custom-cbd-boxes",
  "custom-mylar-bags",
  "custom-pizza-boxes",
  "custom-candle-boxes",
];

function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

function link(label: string, url: string): string {
  return `- [${label}](${url})`;
}

export async function GET() {
  const categories = getCategories();
  const products = await getPublicProducts();
  const posts = getPosts();

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  const featuredCategories = FEATURED_CATEGORY_SLUGS.flatMap((slug) => {
    const category = categoryBySlug.get(slug);
    return category ? [link(category.name, absolute(categoryPath(category)))] : [];
  });

  const featuredProducts = FEATURED_PRODUCT_SLUGS.flatMap((slug) => {
    const product = productBySlug.get(slug);
    return product ? [link(product.name, absolute(productPath(product)))] : [];
  });

  const recentPosts = posts
    .slice(0, 6)
    .map((post) => link(post.title, absolute(`/blog/${post.slug}/`)));

  const body = [
    `# ${SITE_NAME}`,
    "",
    "> Vital Custom Boxes is a custom packaging supplier for brands that need printed boxes, retail packaging, mailer boxes, food packaging, cosmetic packaging, rigid boxes, mylar bags, and quote-based wholesale packaging support.",
    "",
    "## Core Pages",
    link("Home", `${SITE_URL}/`),
    link("Shop Custom Packaging", absolute("/shop/")),
    link("Get a Custom Quote", absolute("/get-custom-quote/")),
    link("How It Works", absolute("/how-it-works/")),
    link("Materials Guide", absolute("/materials/")),
    link("Box Styles", absolute("/box-styles/")),
    link("Customer Reviews", absolute("/reviews/")),
    link("FAQs", absolute("/faqs/")),
    "",
    "## Featured Shop Sections",
    ...featuredCategories,
    "",
    "## Featured Product Pages",
    ...featuredProducts,
    "",
    "## Helpful Guides",
    ...recentPosts,
    "",
    "## Policies And Contact",
    link("Contact", absolute("/contact/")),
    link("Shipping Policy", absolute("/shipping-policy/")),
    link("Return Policy", absolute("/return-policy/")),
    link("Privacy Policy", absolute("/privacy-policy/")),
    link("Terms And Conditions", absolute("/terms-conditions/")),
    "",
    "## Discovery Files",
    link("XML Sitemap", absolute("/sitemap.xml")),
    link("Robots.txt", absolute("/robots.txt")),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
