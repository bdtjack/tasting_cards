// BusinessCategory, ProductStatus, etc. are stored as plain strings in the
// database (a leftover from the project's SQLite days — see the note at the
// top of prisma/schema.prisma). These types give the same safety at the
// TypeScript layer that a Postgres enum would give at the database layer.

export type BusinessCategory = "WINERY" | "BREWERY" | "DISTILLERY" | "MIXED";

// The choices shown in the signup form and the settings page.
export const BUSINESS_CATEGORY_OPTIONS: { value: BusinessCategory; label: string }[] = [
  { value: "WINERY", label: "Winery" },
  { value: "BREWERY", label: "Brewery" },
  { value: "DISTILLERY", label: "Distillery" },
  { value: "MIXED", label: "Mixed" },
];

export type ProductType = "WINE" | "BEER" | "SPIRIT" | "COCKTAIL";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FlightKind = "PRESET" | "BUILD_YOUR_OWN";

// Bounds for how many picks a build-your-own flight asks for. Most
// tasting rooms do 4 or 5; the business can set anything in this range.
export const MIN_SELECTIONS = 2;
export const MAX_SELECTIONS = 12;
