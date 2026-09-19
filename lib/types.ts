// SQLite (used for local dev) has no native enum type, so BusinessCategory
// and ProductStatus are stored as plain strings in the database. These
// types give the same safety at the TypeScript layer that a Postgres enum
// would give at the database layer.

export type BusinessCategory = "WINERY" | "BREWERY" | "DISTILLERY" | "MIXED";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
