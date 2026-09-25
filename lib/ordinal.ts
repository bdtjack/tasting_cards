const WORDS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
];

/** 0 → "First", 1 → "Second", … falls back to "#13" past the list. */
export function ordinalWord(index: number): string {
  return WORDS[index] ?? `#${index + 1}`;
}
