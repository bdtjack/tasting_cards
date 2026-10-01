import { MENU_SECTION_LABELS, inferProductType, menuSectionOrder } from "./fields";
import { SUBTYPES, resolveSubtype } from "./subtypes";
import type { BusinessCategory } from "./types";

// Groups products the way the guest menu shows them: kind of drink first
// (Wine / Beer / Spirits / Cocktails, the business's own kind leading),
// then style within it (Red / White …, IPA / Lager …, Whiskey / Gin …).
// Used by the guest menu, the dashboard's product list and the flight
// product picker, so all three always agree.
//
// Nothing ever disappears: a product whose kind can't be told goes under
// "More" at the end, and one whose style can't be told under "Other" at the
// end of its section. Products keep the order they were passed in within
// each group, so the caller decides the sort (e.g. available before sold out).

export type GroupableProduct = {
  productType: string | null;
  priceLabels: string | null;
  subtype: string | null;
  name: string;
  category: string;
  subtitle: string | null;
  description: string | null;
};

export type ProductGroup<T> = {
  key: string;
  /** Style heading, e.g. "Red". Null when the section has no real styles to show. */
  label: string | null;
  products: T[];
};

export type ProductSection<T> = {
  key: string;
  /** e.g. "Wine", "Spirits", or "More" for products whose kind is unknown. */
  label: string;
  count: number;
  groups: ProductGroup<T>[];
};

export function groupProductsForMenu<T extends GroupableProduct>(
  products: T[],
  category: BusinessCategory
): ProductSection<T>[] {
  const typeOf = (product: T) => inferProductType(product, category) ?? "MORE";

  return [...menuSectionOrder(category), "MORE" as const]
    .map((key) => {
      const sectionProducts = products.filter((product) => typeOf(product) === key);
      let groups: ProductGroup<T>[];
      if (key === "MORE") {
        groups = [{ key: "ALL", label: null, products: sectionProducts }];
      } else {
        const styleOf = (product: T) => resolveSubtype(key, product) ?? "OTHER";
        groups = SUBTYPES[key]
          .map((subtype) => ({
            key: subtype.id,
            label: subtype.label as string | null,
            products: sectionProducts.filter((product) => styleOf(product) === subtype.id),
          }))
          .filter((group) => group.products.length > 0);
        // A section that's all "Other" doesn't need the subheading.
        if (groups.length === 1 && groups[0].key === "OTHER") groups[0].label = null;
      }
      return {
        key,
        label: key === "MORE" ? "More" : MENU_SECTION_LABELS[key],
        count: sectionProducts.length,
        groups,
      };
    })
    .filter((section) => section.count > 0);
}

/** What the flight product picker needs per product, already in menu order. */
export type PickerProduct = {
  id: string;
  name: string;
  category: string;
  status: string;
  /** Menu section label, e.g. "Wine". */
  section: string;
  /** Style label, e.g. "Red" — null when the section shows no styles. */
  group: string | null;
};

/** Fields to select from the database for toPickerProducts(). */
export const PICKER_PRODUCT_SELECT = {
  id: true,
  name: true,
  category: true,
  subtitle: true,
  description: true,
  status: true,
  productType: true,
  priceLabels: true,
  subtype: true,
} as const;

/** Products for the flight picker, in menu order and labelled with their section and style. */
export function toPickerProducts<T extends GroupableProduct & { id: string; status: string }>(
  products: T[],
  category: BusinessCategory
): PickerProduct[] {
  return groupProductsForMenu(products, category).flatMap((section) =>
    section.groups.flatMap((group) =>
      group.products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        status: product.status,
        section: section.label,
        group: group.label,
      }))
    )
  );
}
