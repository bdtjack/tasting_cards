// Sample content for the demo business (npm run db:seed:demo) — a made-up
// mixed tasting room used to show prospective customers what a full menu
// looks like: wine, spirits, beer and cocktails, each with styles, prices,
// tasting notes, a sold-out item and flights. Everything here is fictional.
//
// Product types and styles (subtype) use the ids from lib/fields.ts and
// lib/subtypes.ts. Notes are kept under the form limits in lib/validate.ts.

import type { ProductType } from "../lib/types";

export type DemoProduct = {
  slug: string;
  name: string;
  type: ProductType;
  subtype: string;
  category: string;
  subtitle?: string;
  proofAbv?: string;
  description?: string;
  aroma?: string;
  palate?: string;
  finish?: string;
  /** Keyed by the price labels for the type: Glass/Bottle, Oz/Bottle, Taste/Pour/Pack, Price. */
  prices: Record<string, string>;
  archived?: boolean;
};

export const DEMO_BUSINESS = {
  slug: "demo",
  name: "Copper Hollow Tasting Room",
  email: "demo@copperhollow.example",
  category: "MIXED",
  primaryColor: "#1C2B24",
  accentColor: "#D08A4E",
  cardFont: "rustic",
  sharePhrase: "Look what I'm sipping!",
} as const;

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ── Wine ──────────────────────────────────────────────────────────────
  {
    slug: "hollow-red-2022",
    name: "Hollow Red",
    type: "WINE",
    subtype: "RED",
    category: "Chambourcin",
    subtitle: "2022 vintage",
    description: "100% estate Chambourcin, aged 10 months in neutral French oak.",
    aroma: "Black cherry, violet, cracked pepper",
    palate: "Juicy dark berry, soft tannins, hint of spice",
    finish: "Medium, with lingering plum",
    prices: { Glass: "$11.00", Bottle: "$32.00" },
  },
  {
    slug: "riverstone-chardonnay-2023",
    name: "Riverstone Chardonnay",
    type: "WINE",
    subtype: "WHITE",
    category: "Chardonnay",
    subtitle: "2023 vintage, lightly oaked",
    aroma: "Yellow apple, lemon curd, toasted almond",
    palate: "Ripe pear, citrus, creamy mid-palate",
    finish: "Clean, with a touch of vanilla",
    prices: { Glass: "$12.00", Bottle: "$34.00" },
  },
  {
    slug: "cellar-rose-2023",
    name: "Cellar Rosé",
    type: "WINE",
    subtype: "ROSE",
    category: "Dry rosé",
    subtitle: "2023 vintage",
    description: "Cabernet Franc and Merlot, pressed after a short soak on the skins.",
    aroma: "Strawberry, watermelon rind, rose petal",
    palate: "Crisp red berry, bright acidity",
    finish: "Dry and refreshing",
    prices: { Glass: "$10.00", Bottle: "$30.00" },
  },
  {
    slug: "copper-bubbles",
    name: "Copper Bubbles",
    type: "WINE",
    subtype: "SPARKLING",
    category: "Brut sparkling",
    subtitle: "Non-vintage",
    aroma: "Green apple, brioche, white flowers",
    palate: "Fine bubbles, citrus zest, toasty edge",
    finish: "Crisp and lively",
    prices: { Glass: "$13.00", Bottle: "$38.00" },
  },
  {
    slug: "reserve-cabernet-franc-2020",
    name: "Reserve Cabernet Franc",
    type: "WINE",
    subtype: "RED",
    category: "Cabernet Franc",
    subtitle: "2020 vintage",
    aroma: "Red currant, tobacco leaf, graphite",
    palate: "Structured red fruit, firm tannins",
    finish: "Long and savory",
    prices: { Glass: "$15.00", Bottle: "$46.00" },
    archived: true, // shows the "Sold out" state
  },

  // ── Spirits ───────────────────────────────────────────────────────────
  {
    slug: "barrel-house-bourbon",
    name: "Barrel House Bourbon",
    type: "SPIRIT",
    subtype: "WHISKEY",
    category: "Straight bourbon",
    subtitle: "Aged 4 years",
    proofAbv: "92 proof",
    description: "Mash bill: 70% corn, 20% rye, 10% malted barley. Charred new American oak.",
    aroma: "Caramel, vanilla bean, toasted oak",
    palate: "Brown sugar, baking spice, orange peel",
    finish: "Warm and lingering",
    prices: { Oz: "$9.00", Bottle: "$48.00" },
  },
  {
    slug: "hollow-rye",
    name: "Hollow Rye",
    type: "SPIRIT",
    subtype: "WHISKEY",
    category: "Rye whiskey",
    subtitle: "Small batch",
    proofAbv: "100 proof",
    description: "Mash bill: 95% rye, 5% malted barley.",
    aroma: "Black pepper, dill, dried cherry",
    palate: "Bold spice, honey, toffee",
    finish: "Dry and peppery",
    prices: { Oz: "$10.00", Bottle: "$52.00" },
  },
  {
    slug: "wildflower-gin",
    name: "Wildflower Gin",
    type: "SPIRIT",
    subtype: "GIN",
    category: "New Western gin",
    proofAbv: "88 proof",
    description: "Juniper, lavender, chamomile, lemon peel and coriander.",
    aroma: "Floral, bright citrus, soft juniper",
    palate: "Lavender, lemon, gentle pine",
    finish: "Crisp and herbal",
    prices: { Oz: "$8.00", Bottle: "$38.00" },
  },
  {
    slug: "dark-harbor-spiced-rum",
    name: "Dark Harbor Spiced Rum",
    type: "SPIRIT",
    subtype: "RUM",
    category: "Spiced rum",
    proofAbv: "80 proof",
    aroma: "Molasses, clove, vanilla",
    palate: "Cinnamon, allspice, brown sugar",
    finish: "Smooth and warming",
    prices: { Oz: "$8.00", Bottle: "$34.00" },
  },
  {
    slug: "apple-pie-moonshine",
    name: "Apple Pie Moonshine",
    type: "SPIRIT",
    subtype: "MOONSHINE",
    category: "Flavored moonshine",
    proofAbv: "60 proof",
    aroma: "Baked apple, cinnamon stick",
    palate: "Sweet apple cider, warm spice",
    finish: "Like dessert in a glass",
    prices: { Oz: "$6.00", Bottle: "$28.00" },
  },

  // ── Beer ──────────────────────────────────────────────────────────────
  {
    slug: "hazy-hollow-ipa",
    name: "Hazy Hollow",
    type: "BEER",
    subtype: "IPA",
    category: "Hazy IPA",
    proofAbv: "6.8% ABV",
    description: "Hops: Citra, Mosaic and Galaxy. Oats and wheat for a soft body.",
    aroma: "Mango, passion fruit, citrus",
    palate: "Juicy tropical fruit, pillowy mouthfeel",
    finish: "Low bitterness, soft and fruity",
    prices: { Taste: "$3.00", Pour: "$8.00", Pack: "$16.00" },
  },
  {
    slug: "porch-light-pilsner",
    name: "Porch Light",
    type: "BEER",
    subtype: "LAGER",
    category: "Pilsner",
    proofAbv: "4.9% ABV",
    aroma: "Fresh bread, floral hops",
    palate: "Crisp malt, light honey",
    finish: "Clean and snappy",
    prices: { Taste: "$3.00", Pour: "$7.00", Pack: "$14.00" },
  },
  {
    slug: "copper-amber-ale",
    name: "Copper Ale",
    type: "BEER",
    subtype: "AMBER",
    category: "Amber ale",
    proofAbv: "5.6% ABV",
    aroma: "Caramel, toasted bread",
    palate: "Toffee malt, balanced hop bite",
    finish: "Smooth, slightly nutty",
    prices: { Taste: "$3.00", Pour: "$7.00", Pack: "$15.00" },
  },
  {
    slug: "orchard-raspberry-sour",
    name: "Orchard Sour",
    type: "BEER",
    subtype: "SOUR",
    category: "Raspberry sour",
    proofAbv: "5.4% ABV",
    aroma: "Fresh raspberry, lemon",
    palate: "Tart berry, bright acidity",
    finish: "Zippy and refreshing",
    prices: { Taste: "$3.50", Pour: "$8.00", Pack: "$17.00" },
  },
  {
    slug: "night-shift-stout",
    name: "Night Shift",
    type: "BEER",
    subtype: "STOUT",
    category: "Oatmeal stout",
    proofAbv: "6.2% ABV",
    aroma: "Dark chocolate, roasted coffee",
    palate: "Silky oats, cocoa, light roast",
    finish: "Creamy with a gentle bitterness",
    prices: { Taste: "$3.00", Pour: "$8.00", Pack: "$16.00" },
  },

  // ── Cocktails ─────────────────────────────────────────────────────────
  {
    slug: "barrel-house-old-fashioned",
    name: "Barrel House Old Fashioned",
    type: "COCKTAIL",
    subtype: "WHISKEY",
    category: "House classic",
    description: "Barrel House Bourbon, demerara, aromatic and orange bitters, orange peel.",
    aroma: "Orange oil, vanilla",
    palate: "Rich bourbon, gentle sweetness, spice",
    finish: "Warm and smooth",
    prices: { Price: "$14.00" },
  },
  {
    slug: "wildflower-gimlet",
    name: "Wildflower Gimlet",
    type: "COCKTAIL",
    subtype: "GIN",
    category: "Bright & floral",
    description: "Wildflower Gin, fresh lime, lavender honey syrup.",
    aroma: "Lavender, lime zest",
    palate: "Tart citrus, floral honey",
    finish: "Crisp and clean",
    prices: { Price: "$13.00" },
  },
  {
    slug: "hollow-mule",
    name: "Hollow Mule",
    type: "COCKTAIL",
    subtype: "VODKA",
    category: "Served in copper",
    description: "Vodka, house ginger beer, lime, fresh mint.",
    aroma: "Ginger, mint",
    palate: "Spicy ginger, bright lime",
    finish: "Cool and fizzy",
    prices: { Price: "$12.00" },
  },
  {
    slug: "cellar-spritz",
    name: "Cellar Spritz",
    type: "COCKTAIL",
    subtype: "WINE_BASED",
    category: "Light & bubbly",
    description: "Copper Bubbles, Cellar Rosé, elderflower, soda, grapefruit twist.",
    aroma: "Grapefruit, elderflower",
    palate: "Juicy berry, floral, lightly bitter",
    finish: "Refreshing and dry",
    prices: { Price: "$11.00" },
  },
  {
    slug: "garden-fizz",
    name: "Garden Fizz",
    type: "COCKTAIL",
    subtype: "ZERO_PROOF",
    category: "Zero-proof",
    description: "Cucumber, basil, lime and sparkling water.",
    aroma: "Fresh cucumber, basil",
    palate: "Cool, herbal, citrusy",
    finish: "Light and crisp",
    prices: { Price: "$8.00" },
  },
];

export const DEMO_FLIGHTS = [
  {
    slug: "distillery-flight",
    name: "Distillery Flight",
    description: "Four of our spirits, poured neat, lightest to boldest.",
    price: "$18.00",
    productSlugs: ["wildflower-gin", "dark-harbor-spiced-rum", "barrel-house-bourbon", "hollow-rye"],
  },
  {
    slug: "taproom-sampler",
    name: "Taproom Sampler",
    description: "A taste of everything on tap.",
    price: "$12.00",
    productSlugs: ["porch-light-pilsner", "hazy-hollow-ipa", "orchard-raspberry-sour", "night-shift-stout"],
  },
];

export const DEMO_BUILD_YOUR_OWN = {
  slug: "build-your-own-flight",
  name: "Build Your Own Flight",
  description: "Pick any four pours from the menu.",
  price: "$20.00",
  selectionCount: 4,
};
