export interface PackagingLanding {
  slug: string;
  title: string;
  description: string;
  intro: string;
  productSlugs: string[];
  heroProduct: string;
  guide: string[];
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  related: { name: string; href: string }[];
  blogPattern: string;
}

export const PACKAGING_LANDINGS: Record<string, PackagingLanding> = {
  'custom-shipping-boxes': {
    slug: 'custom-shipping-boxes',
    title: 'Custom Shipping Boxes',
    description: 'Plan custom shipping boxes around product weight, packing and delivery needs. Explore related packaging with free design support and a custom quote.',
    intro: 'A shipping box starts with the complete packed product, rather than appearance alone. Include cushioning, inserts and accessories when defining the internal dimensions. Share the packed weight, delivery method and handling conditions so the board and closure requirements can be discussed. Confirm and assess the complete pack for its intended journey before production.',
    productSlugs: ['custom-candle-shipping-boxes', 'custom-corrugated-mailer-boxes'],
    heroProduct: 'custom-corrugated-mailer-boxes',
    guide: ['Measure the product with cushioning and accessories included.', 'Provide total packed weight and your delivery method.', 'Discuss closure, stacking and any fragile contents.', 'Confirm board specifications and assess the complete packing arrangement.'],
    specs: [
      { label: 'Dimensions', value: 'Internal dimensions based on the complete packed product.' },
      { label: 'Board', value: 'Corrugated construction and board specifications confirmed against your requirements.' },
      { label: 'Packing', value: 'Cushioning, inserts and closure arrangements discussed for the intended journey.' },
      { label: 'Printing', value: 'Logo and handling artwork options confirmed for the selected stock.' },
      { label: 'Performance', value: 'Any load or transit requirements must be specified and assessed for the full pack.' },
    ],
    faqs: [
      { question: 'What measurements are needed for a shipping box?', answer: 'Measure the complete contents with inserts, cushioning and accessories. Share the packed weight and confirm internal dimensions before ordering.' },
      { question: 'How is a shipping box different from a presentation box?', answer: 'Shipping packaging is planned around transport and handling. A presentation box may need an outer carton and cushioning, even when it fits the product closely.' },
      { question: 'Does corrugated board guarantee protection?', answer: 'No. Protection depends on the board specification, structure, contents, cushioning, closure and delivery conditions. Confirm and assess the complete pack for its intended use.' },
      { question: 'Can shipping boxes carry my logo?', answer: 'Ask about printed branding and artwork when requesting your quote. Available coverage is confirmed for the selected stock, with a digital proof before printing.' },
      { question: 'Can I request packaging for fragile products?', answer: 'Describe the product, weight, fragile parts and delivery method. Discuss inserts, cushioning and any testing requirements before approving the final configuration.' },
    ],
    related: [
      { name: 'Custom Mailer Boxes', href: '/shop/custom-mailer-boxes/' },
      { name: 'Custom Corrugated Boxes', href: '/custom-corrugated-boxes/' },
      { name: 'Custom Insert Boxes', href: '/shop/custom-insert-boxes/' },
      { name: 'Custom Product Boxes', href: '/shop/custom-product-packaging-boxes/' },
    ],
    blogPattern: 'shipping|corrugated|mailer|box dimensions|packaging size',
  },
  'custom-kraft-boxes': {
    slug: 'custom-kraft-boxes',
    title: 'Custom Kraft Boxes',
    description: 'Explore custom kraft boxes for products, candles and presentation. Compare printed styles and insert options with free design support and a custom quote.',
    intro: 'Kraft describes a paper material or appearance, rather than a single box construction. Compare folding cartons, corrugated structures and insert layouts around your product and packing needs. Share your artwork and preferred paper shade, since the substrate can affect printed color appearance. Confirm the exact stock and any coatings before making recycling or material-content claims.',
    productSlugs: ['custom-printed-kraft-boxes', 'custom-kraft-candle-boxes', 'custom-kraft-boxes-with-insert', 'custom-kraft-pizza-boxes'],
    heroProduct: 'custom-printed-kraft-boxes',
    guide: ['Provide dimensions and weight for the complete contents.', 'Specify your preferred paper shade and artwork coverage.', 'Discuss inserts, coatings and the intended handling conditions.', 'Request specifications for any material or recycling claims.'],
    specs: [
      { label: 'Stock', value: 'Exact kraft paper or board construction confirmed with your quote.' },
      { label: 'Structures', value: 'Product cartons, candle packaging and insert styles depending on the selected design.' },
      { label: 'Sizes', value: 'Internal dimensions confirmed around your contents.' },
      { label: 'Printing', value: 'Artwork options reviewed against the selected paper color and surface.' },
      { label: 'Material claims', value: 'Recycled content, food contact and recyclability require confirmation for the exact specification.' },
    ],
    faqs: [
      { question: 'Are kraft boxes the same as corrugated boxes?', answer: 'No. Kraft refers to paper material, while corrugated describes a fluted board construction. A corrugated box can use kraft liners, but not every kraft box is corrugated.' },
      { question: 'Can my logo be printed on kraft packaging?', answer: 'Yes. Share artwork and color expectations. The paper shade can affect color appearance, so confirm the printing specification and whether a physical sample is needed.' },
      { question: 'Are all kraft boxes recycled or recyclable?', answer: 'Do not infer these properties from a brown appearance. Fiber content, coatings, adhesives and local collection arrangements affect the claim. Request details for the exact material.' },
      { question: 'Can kraft packaging include an insert?', answer: 'Ask about inserts with your quote. Provide product measurements, weight and layout requirements so the box and insert can be considered together.' },
      { question: 'Can kraft boxes touch food directly?', answer: 'Suitability depends on the exact stock, coating, printing and intended food contact. Describe your use and request relevant material specifications before ordering.' },
    ],
    related: [
      { name: 'Custom Corrugated Boxes', href: '/custom-corrugated-boxes/' },
      { name: 'Custom Candle Boxes', href: '/shop/custom-candle-boxes/' },
      { name: 'Custom Printed Bags', href: '/shop/custom-printed-bags/' },
      { name: 'Custom Insert Boxes', href: '/shop/custom-insert-boxes/' },
    ],
    blogPattern: 'kraft|recycl|material|sustainab|printing',
  },
  'custom-corrugated-boxes': {
    slug: 'custom-corrugated-boxes',
    title: 'Custom Corrugated Boxes',
    description: 'Explore custom corrugated boxes for mailers, displays and product packing. Discuss board, sizing and printing with free design support and a custom quote.',
    intro: 'Corrugated board uses a fluted layer between liner sheets, with specifications that vary by construction. Start with your product weight, packed dimensions and handling requirements before selecting a style. Mailers, counter displays and food packaging have different needs, even when they use corrugated board. Confirm the board specification and closure, then assess the complete pack for its intended use.',
    productSlugs: ['custom-corrugated-mailer-boxes', 'custom-corrugated-display-boxes', 'custom-corrugated-pizza-boxes'],
    heroProduct: 'custom-corrugated-mailer-boxes',
    guide: ['Provide packed dimensions, total weight and intended use.', 'Specify stacking and transport conditions where relevant.', 'Discuss board grade, flute and printing requirements.', 'Confirm insert, closure and any performance requirements before ordering.'],
    specs: [
      { label: 'Construction', value: 'Fluted board with liner sheets; exact grade and flute confirmed for the order.' },
      { label: 'Styles', value: 'Mailer, display and pizza packaging examples from the current catalogue.' },
      { label: 'Dimensions', value: 'Internal dimensions based on contents and protective packing.' },
      { label: 'Printing', value: 'Logo and artwork options depend on board surface and printing method.' },
      { label: 'Handling', value: 'Load, stacking and delivery requirements reviewed for the selected configuration.' },
    ],
    faqs: [
      { question: 'What makes a box corrugated?', answer: 'Corrugated board includes a fluted layer between liner sheets. Its grade, flute and construction affect performance; the term alone does not define a load rating.' },
      { question: 'How do I choose a corrugated board specification?', answer: 'Provide packed dimensions, weight, stacking and handling requirements. Confirm the proposed grade and construction with your quote rather than choosing by appearance.' },
      { question: 'Can corrugated boxes be custom printed?', answer: 'Ask about logo printing, coverage and artwork requirements. Available methods and finish options depend on the selected board and intended use.' },
      { question: 'Are all corrugated boxes suitable for shipping?', answer: 'No. A display or food-service structure may have different requirements from a shipping carton. Confirm the full packing configuration for its intended handling conditions.' },
      { question: 'Can corrugated boxes be recycled?', answer: 'Recyclability depends on the exact materials, coatings, contamination and local collection arrangements. Request material details before making a disposal claim.' },
    ],
    related: [
      { name: 'Custom Shipping Boxes', href: '/custom-shipping-boxes/' },
      { name: 'Custom Kraft Boxes', href: '/custom-kraft-boxes/' },
      { name: 'Custom Mailer Boxes', href: '/shop/custom-mailer-boxes/' },
      { name: 'Custom Display Boxes', href: '/shop/custom-display-boxes/' },
    ],
    blogPattern: 'corrugated|shipping|mailer|material|box dimensions',
  },
};
