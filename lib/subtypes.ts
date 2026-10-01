import type { ProductType } from "./types";

// The second level of the guest menu: Wine → Red / White / Sparkling …,
// Spirits → Whiskey / Gin / Rum …, Beer → IPA / Pale Ale …, Cocktails →
// grouped by base spirit. The business picks one on the product form;
// products saved before this existed are sorted by guessing from their
// name, category and subtitle (see inferSubtype).
//
// Ids are what's stored in Product.subtype, so never rename one — only
// labels. Order here is the order sections appear on the menu; "OTHER" is
// always last.

export type Subtype = { id: string; label: string };

const SPIRIT_BASES: Subtype[] = [
  { id: "WHISKEY", label: "Whiskey" },
  { id: "GIN", label: "Gin" },
  { id: "VODKA", label: "Vodka" },
  { id: "RUM", label: "Rum" },
  { id: "AGAVE", label: "Tequila & Mezcal" },
  { id: "BRANDY", label: "Brandy" },
  { id: "MOONSHINE", label: "Moonshine" },
];

export const SUBTYPES: Record<ProductType, Subtype[]> = {
  WINE: [
    { id: "RED", label: "Red" },
    { id: "WHITE", label: "White" },
    { id: "ROSE", label: "Rosé" },
    { id: "SPARKLING", label: "Sparkling" },
    { id: "ORANGE", label: "Orange" },
    { id: "DESSERT", label: "Dessert" },
    { id: "OTHER", label: "Other" },
  ],
  SPIRIT: [...SPIRIT_BASES, { id: "LIQUEUR", label: "Liqueur" }, { id: "OTHER", label: "Other" }],
  BEER: [
    { id: "IPA", label: "IPA" },
    { id: "PALE_ALE", label: "Pale Ale" },
    { id: "LAGER", label: "Lager & Pilsner" },
    { id: "WHEAT", label: "Wheat" },
    { id: "SOUR", label: "Sour" },
    { id: "STOUT", label: "Stout & Porter" },
    { id: "AMBER", label: "Amber & Brown" },
    { id: "BELGIAN", label: "Belgian" },
    { id: "CIDER", label: "Cider & Seltzer" },
    { id: "OTHER", label: "Other" },
  ],
  // Grouped by base spirit, like the spirits list, plus the two kinds
  // wineries and breweries pour most: wine-based (spritzes, sangria) and
  // zero-proof.
  COCKTAIL: [
    ...SPIRIT_BASES,
    { id: "WINE_BASED", label: "Wine-based" },
    { id: "ZERO_PROOF", label: "Zero-proof" },
    { id: "OTHER", label: "Other" },
  ],
};

/** Label for the picker on the product form. */
export const SUBTYPE_FIELD_LABELS: Record<ProductType, string> = {
  WINE: "Wine style",
  SPIRIT: "Spirit type",
  BEER: "Beer style",
  COCKTAIL: "Base spirit",
};

export function isSubtypeFor(type: ProductType, value: unknown): value is string {
  return typeof value === "string" && SUBTYPES[type].some((subtype) => subtype.id === value);
}

// Keyword rules for guessing a subtype from text, checked in order — so
// e.g. "late harvest" (dessert) wins over the grape name, and "hazy IPA"
// is an IPA before it's anything else.
const RULES: Record<ProductType, [string, RegExp][]> = {
  WINE: [
    ["SPARKLING", /sparkling|champagne|prosecco|\bcava\b|cr[eé]mant|p[eé]t[- ]?nat|\bbrut\b|bubbl/],
    ["DESSERT", /dessert|late harvest|ice ?wine|\bport\b|sherry|madeira|sauternes|fortified/],
    // Letter checks rather than \b, which doesn't see "é" as a letter;
    // and both sides, so "Primrose" doesn't count.
    ["ROSE", /(?<![a-z])ros[eé](?![a-z])|rosado/],
    ["ORANGE", /orange wine|skin[- ]contact|amber wine/],
    ["RED", /\bred\b|pinot noir|cabernet|merlot|syrah|shiraz|zinfandel|malbec|sangiovese|tempranillo|grenache|nebbiolo|barbera|chambourcin|petit verdot|gamay|norton|carmen[eè]re|mourv[eè]dre|petite sirah|blaufr[aä]nkisch|lemberger|chianti|bordeaux|rioja/],
    ["WHITE", /\bwhite\b|chardonnay|sauvignon blanc|riesling|pinot gris|pinot grigio|viognier|albari[nñ]o|gew[uü]rztraminer|chenin|vidal|seyval|moscato|muscat|gr[uü]ner|s[eé]millon|traminette|vermentino|marsanne|roussanne|chablis|blanc\b/],
  ],
  SPIRIT: [
    ["WHISKEY", /whiske?y|bourbon|\brye\b|scotch|malt/],
    ["GIN", /\bgin\b/],
    ["VODKA", /vodka/],
    ["RUM", /\brum\b|rhum|cacha[cç]a/],
    ["AGAVE", /tequila|mezcal|agave|reposado|a[nñ]ejo|blanco/],
    ["BRANDY", /brandy|cognac|armagnac|grappa|calvados|pisco|eau de vie|applejack/],
    ["MOONSHINE", /moonshine|white lightning|corn liquor/],
    ["LIQUEUR", /liqueur|amaro|schnapps|aperitif|ap[eé]ritivo|cream\b|limoncello|absinthe|vermouth|bitters/],
  ],
  BEER: [
    ["IPA", /\bipa\b|india pale|\bneipa\b|double ipa|\bdipa\b/],
    ["CIDER", /cider|seltzer|perry|mead/],
    ["SOUR", /sour|gose|berliner|lambic|gueuze|\bwild\b|kriek|flanders/],
    ["STOUT", /stout|porter/],
    ["WHEAT", /wheat|hefe|witbier|\bwit\b|weiss|weizen/],
    ["BELGIAN", /belgian|tripel|dubbel|quad|saison|farmhouse/],
    ["LAGER", /lager|pils|helles|k[oö]lsch|m[aä]rzen|oktoberfest|\bbock\b|dunkel|vienna/],
    ["PALE_ALE", /pale ale|\bapa\b|\bpale\b|blonde|golden ale|cream ale/],
    ["AMBER", /amber|brown|red ale|irish red|esb|bitter\b|scotch ale|barleywine/],
  ],
  // Spirits are checked before wine-based, because a description often
  // lists vermouth or a sparkling topper alongside the base spirit (a
  // Negroni is a gin drink, not a wine one). Vodka before gin so an
  // espresso martini lands under vodka.
  COCKTAIL: [
    ["ZERO_PROOF", /mocktail|zero[- ]proof|non[- ]?alcoholic|n\/a\b|alcohol[- ]free|virgin/],
    ["WHISKEY", /whiske?y|bourbon|\brye\b|scotch|old fashioned|manhattan|sazerac|boulevardier|mint julep|hot toddy|penicillin/],
    ["AGAVE", /tequila|mezcal|margarita|paloma|agave/],
    ["RUM", /\brum\b|mojito|daiquiri|mai tai|pi[nñ]a colada|dark ['’]?n['’]? stormy|zombie/],
    ["VODKA", /vodka|moscow mule|cosmo|bloody mary|espresso martini|screwdriver/],
    ["GIN", /\bgin\b|negroni|martini|gimlet|tom collins|french 75|aviation|bee['’]?s knees/],
    ["BRANDY", /brandy|cognac|sidecar|pisco|calvados/],
    ["MOONSHINE", /moonshine/],
    ["WINE_BASED", /spritz|sangria|mimosa|bellini|kir\b|wine|prosecco|champagne|sparkling/],
  ],
};

/**
 * Best guess at a product's subtype from its text, for products saved
 * before businesses picked one. Cocktails also look at the description,
 * which usually lists the ingredients; other types don't, since a
 * description like "aged in bourbon barrels" would mislead.
 */
export function inferSubtype(
  type: ProductType,
  product: { name: string; category: string; subtitle: string | null; description: string | null }
): string | null {
  const text = [
    product.name,
    product.category,
    product.subtitle,
    type === "COCKTAIL" ? product.description : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const [id, pattern] of RULES[type]) {
    if (pattern.test(text)) return id;
  }
  return null;
}

/** The saved subtype if it's valid for this type, otherwise the best guess, otherwise null. */
export function resolveSubtype(
  type: ProductType,
  product: {
    subtype: string | null;
    name: string;
    category: string;
    subtitle: string | null;
    description: string | null;
  }
): string | null {
  return isSubtypeFor(type, product.subtype) ? product.subtype : inferSubtype(type, product);
}

/** Reads the subtype picker from a product form; anything not valid for this type becomes null. */
export function readSubtype(formData: FormData, type: ProductType): string | null {
  const value = formData.get("subtype");
  return isSubtypeFor(type, value) ? value : null;
}
