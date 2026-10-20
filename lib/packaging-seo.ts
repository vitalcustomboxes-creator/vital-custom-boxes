export interface PackagingSeoConfig {
  title: string;
  h1: string;
  description: string;
  specs: { label: string; value: string }[];
  relatedSlugs: string[];
  blogSlugs: string[];
}

/** Central page-specific SEO, specifications and relevant link targets. */
export const CATEGORY_PACKAGING_SEO: Record<string, PackagingSeoConfig> = {
  "custom-mailer-boxes": {
    "title": "Custom Mailer Boxes with Logo USA | Vital Custom Boxes",
    "h1": "Custom Mailer Boxes with Logo",
    "description": "Custom mailer boxes with logo for US e-commerce and subscription brands. Compare sizes and printing with free design support and free US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Corrugated board; grade, flute and liners selected for the packed product."
      },
      {
        "label": "Styles",
        "value": "Roll-end and tuck-front mailer structures; closure confirmed with your quote."
      },
      {
        "label": "Sizes",
        "value": "Internal length, width and depth including inserts and protective wrapping."
      },
      {
        "label": "Printing",
        "value": "Outside-only or inside-and-outside logo artwork, subject to the selected board."
      },
      {
        "label": "Finishes",
        "value": "Coatings and print finishes reviewed for the board surface and intended handling."
      }
    ],
    "relatedSlugs": [
      "custom-corrugated-boxes",
      "custom-shipping-boxes",
      "custom-product-packaging-boxes",
      "custom-insert-boxes"
    ],
    "blogSlugs": [
      "custom-logo-boxes-elevating-your-brands-packaging-game",
      "candle-shipping-guide-packaging-costs-and-tips"
    ]
  },
  "custom-rigid-boxes": {
    "title": "Custom Rigid Boxes Wholesale USA | Vital Custom Boxes",
    "h1": "Custom Rigid Boxes for Luxury Packaging",
    "description": "Custom rigid boxes for US retail, gifting and presentation. Compare magnetic, drawer and two-piece styles with free design support and free US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Rigid board with selected paper wrap; thickness confirmed for the design."
      },
      {
        "label": "Styles",
        "value": "Two-piece lid-and-base, drawer and magnetic closure options."
      },
      {
        "label": "Sizes",
        "value": "Box and insert dimensions matched to individual items or a complete gift set."
      },
      {
        "label": "Printing",
        "value": "Printed wraps and brand colors reviewed against the approved artwork."
      },
      {
        "label": "Finishes",
        "value": "Ask about foil, embossing, debossing and laminated wraps for the selected design."
      }
    ],
    "relatedSlugs": [
      "custom-gift-boxes",
      "custom-cosmetics-boxes",
      "custom-insert-boxes",
      "custom-product-packaging-boxes"
    ],
    "blogSlugs": [
      "what-is-rigid-stock-and-why-it-matters-a-detailed-guide",
      "matte-vs-gloss-lamination-for-packaging"
    ]
  },
  "custom-gift-boxes": {
    "title": "Custom Gift Boxes with Logo USA | Vital Custom Boxes",
    "h1": "Custom Gift Boxes with Logo",
    "description": "Custom gift boxes for US brands, corporate gifts and PR kits. Explore printed lids, inserts and finishes with free design support and free US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Cardstock, kraft or rigid board depending on the gift presentation and weight."
      },
      {
        "label": "Styles",
        "value": "Folding cartons, lid-and-base boxes, sleeves and presentation structures."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions based on the full gift set and its packing materials."
      },
      {
        "label": "Printing",
        "value": "Logo, campaign artwork and approved messages on selected panels."
      },
      {
        "label": "Finishes",
        "value": "Foil, coatings and decorative details reviewed for the chosen stock."
      }
    ],
    "relatedSlugs": [
      "custom-rigid-boxes",
      "custom-insert-boxes",
      "custom-apparel-boxes",
      "custom-kraft-boxes"
    ],
    "blogSlugs": [
      "what-is-rigid-stock-and-why-it-matters-a-detailed-guide",
      "custom-logo-boxes-elevating-your-brands-packaging-game"
    ]
  },
  "custom-product-packaging-boxes": {
    "title": "Custom Product Boxes with Logo USA | Vital Custom Boxes",
    "h1": "Custom Product Boxes with Logo",
    "description": "Custom product boxes with logo for US retail brands. Plan carton sizes, printed panels and finishes with free design support, proofing and US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "SBS cardstock, kraft and other board options confirmed for product weight."
      },
      {
        "label": "Styles",
        "value": "Tuck-end, sleeve and lid-and-base formats depending on the product."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions based on the finished item and any insert."
      },
      {
        "label": "Printing",
        "value": "Logo, supplied label text and barcode placement on approved panels."
      },
      {
        "label": "Finishes",
        "value": "Coatings, foil, embossing and window options reviewed for the selected carton."
      }
    ],
    "relatedSlugs": [
      "custom-retail-boxes",
      "custom-mailer-boxes",
      "custom-cosmetics-boxes",
      "custom-insert-boxes"
    ],
    "blogSlugs": [
      "what-is-a-dieline-in-packaging-print",
      "custom-logo-boxes-elevating-your-brands-packaging-game"
    ]
  },
  "custom-cosmetics-boxes": {
    "title": "Custom Cosmetic Boxes Wholesale USA | Vital Custom Boxes",
    "h1": "Custom Cosmetic Boxes with Logo",
    "description": "Custom cosmetic boxes for US skincare, makeup and beauty brands. Compare printed cartons and inserts with free design support and free US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "SBS cardstock and kraft cartons; rigid board for selected presentation sets."
      },
      {
        "label": "Styles",
        "value": "Tuck-end cartons, sleeves and multi-product presentation formats."
      },
      {
        "label": "Sizes",
        "value": "Dimensions around finished containers with caps, pumps and inserts."
      },
      {
        "label": "Printing",
        "value": "CMYK or spot-color artwork options; supplied text and barcodes reviewed on proof."
      },
      {
        "label": "Finishes",
        "value": "Lamination, foil, embossing and window options depend on stock and structure."
      }
    ],
    "relatedSlugs": [
      "custom-product-packaging-boxes",
      "custom-rigid-boxes",
      "custom-insert-boxes",
      "custom-gift-boxes"
    ],
    "blogSlugs": [
      "what-is-a-dieline-in-packaging-print",
      "matte-vs-gloss-lamination-for-packaging"
    ]
  },
  "custom-bakery-boxes": {
    "title": "Custom Bakery Boxes Wholesale USA | Vital Custom Boxes",
    "h1": "Custom Bakery Boxes with Logo",
    "description": "Custom bakery boxes with logo for US bakeries and cafes. Explore cake, cookie and pastry packaging with free design support and free US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Paperboard and selected corrugated constructions; food-contact suitability confirmed."
      },
      {
        "label": "Styles",
        "value": "Cake, cookie and pastry cartons with suitable openings and support."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions including boards, liners, dividers and decoration clearance."
      },
      {
        "label": "Printing",
        "value": "Logo artwork and supplied product information on approved print areas."
      },
      {
        "label": "Finishes",
        "value": "Window, coating and liner options confirmed for the contents and intended contact."
      }
    ],
    "relatedSlugs": [
      "custom-food-boxes",
      "custom-pizza-boxes",
      "custom-takeout-boxes",
      "custom-kraft-boxes"
    ],
    "blogSlugs": [
      "benefits-of-custom-bakery-packaging",
      "types-of-packaging"
    ]
  },
  "custom-candle-boxes": {
    "title": "Custom Candle Boxes Wholesale USA | Vital Custom Boxes",
    "h1": "Custom Candle Boxes with Logo",
    "description": "Custom candle boxes for US candle and home-fragrance brands. Compare kraft cartons, rigid sets and inserts with free design support and US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Cardstock and kraft cartons; rigid board for presentation and selected gift sets."
      },
      {
        "label": "Styles",
        "value": "Tuck-end cartons, lid-and-base boxes and insert-supported formats."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions around the complete vessel and protective components."
      },
      {
        "label": "Printing",
        "value": "Logo, scent names and brand-supplied warning or barcode artwork."
      },
      {
        "label": "Finishes",
        "value": "Foil, embossing and coating options reviewed for the selected material."
      }
    ],
    "relatedSlugs": [
      "custom-insert-boxes",
      "custom-rigid-boxes",
      "custom-shipping-boxes",
      "custom-kraft-boxes"
    ],
    "blogSlugs": [
      "candle-shipping-guide-packaging-costs-and-tips",
      "matte-vs-gloss-lamination-for-packaging"
    ]
  },
  "custom-apparel-boxes": {
    "title": "Custom Apparel & Clothing Boxes USA | Vital Custom Boxes",
    "h1": "Custom Apparel Boxes for Clothing Brands",
    "description": "Custom apparel and clothing boxes for US fashion brands. Explore printed shirt, footwear and gift packaging with free design support and US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "Cardstock, kraft, corrugated or rigid constructions matched to the apparel use."
      },
      {
        "label": "Styles",
        "value": "Shirt cartons, lid-and-base presentation boxes and selected mailer formats."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions around folded garments, footwear and accessories."
      },
      {
        "label": "Printing",
        "value": "Logo, size identification and brand messages on selected surfaces."
      },
      {
        "label": "Finishes",
        "value": "Paper wraps, coatings and decorative finishes depend on the chosen board."
      }
    ],
    "relatedSlugs": [
      "custom-mailer-boxes",
      "custom-gift-boxes",
      "custom-rigid-boxes",
      "custom-product-packaging-boxes"
    ],
    "blogSlugs": [
      "custom-logo-boxes-elevating-your-brands-packaging-game",
      "what-is-a-dieline-in-packaging-print"
    ]
  },
  "custom-boxes": {
    "title": "Custom Boxes with Logo USA | Vital Custom Boxes",
    "h1": "Custom Boxes for US Businesses",
    "description": "Compare custom boxes for US retail, gifting and e-commerce orders. Explore structures, materials and logo printing with free design support and US shipping.",
    "specs": [
      {
        "label": "Materials",
        "value": "SBS cardstock, kraft and other board options confirmed for product weight."
      },
      {
        "label": "Styles",
        "value": "Tuck-end, sleeve and lid-and-base formats depending on the product."
      },
      {
        "label": "Sizes",
        "value": "Internal dimensions based on the finished item and any insert."
      },
      {
        "label": "Printing",
        "value": "Logo, supplied label text and barcode placement on approved panels."
      },
      {
        "label": "Finishes",
        "value": "Coatings, foil, embossing and window options reviewed for the selected carton."
      }
    ],
    "relatedSlugs": [
      "custom-product-packaging-boxes",
      "custom-mailer-boxes",
      "custom-rigid-boxes",
      "custom-shipping-boxes"
    ],
    "blogSlugs": [
      "what-is-a-dieline-in-packaging-print",
      "custom-logo-boxes-elevating-your-brands-packaging-game"
    ]
  }
};

/** Return only posts present in the local catalog, in the curated order. */
export function selectPackagingPosts<T extends { slug: string }>(posts: T[], slugs: string[]): T[] {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  return Array.from(new Set(slugs)).flatMap((slug) => {
    const post = bySlug.get(slug);
    return post ? [post] : [];
  }).slice(0, 2);
}

export function packagingTopicLinks(slugs: string[]): { name: string; href: string }[] {
  const topics: Record<string, string> = {
    "custom-shipping-boxes": "Custom Shipping Boxes",
    "custom-kraft-boxes": "Custom Kraft Boxes",
    "custom-corrugated-boxes": "Custom Corrugated Boxes",
  };
  return slugs.flatMap((slug) => topics[slug] ? [{ name: topics[slug], href: `/${slug}/` }] : []);
}
