// SQLite (used for local dev) has no native enum type, so BusinessCategory
// and ProductStatus are stored as plain strings in the database. These
// types give the same safety at the TypeScript layer that a Postgres enum
// would give at the database layer.

export type BusinessCategory = "WINERY" | "BREWERY" | "DISTILLERY" | "MIXED";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FlightKind = "PRESET" | "BUILD_YOUR_OWN";

// Bounds for how many picks a build-your-own flight asks for. Most
// tasting rooms do 4 or 5; the business can set anything in this range.
export const MIN_SELECTIONS = 2;
export const MAX_SELECTIONS = 12;
