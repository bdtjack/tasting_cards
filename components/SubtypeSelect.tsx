import type { ProductType } from "@/lib/types";
import { SUBTYPES, SUBTYPE_FIELD_LABELS } from "@/lib/subtypes";

/**
 * The "Wine style" / "Spirit type" / "Beer style" / "Base spirit" picker on
 * the product forms. Decides which subsection of the guest menu the
 * product is listed under.
 */
export default function SubtypeSelect({
  type,
  defaultValue,
}: {
  type: ProductType;
  defaultValue: string | null;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-neutral-600 mb-1">{SUBTYPE_FIELD_LABELS[type]}</span>
      <select name="subtype" required defaultValue={defaultValue ?? ""} className="input">
        <option value="" disabled>
          Choose one…
        </option>
        {SUBTYPES[type].map((subtype) => (
          <option key={subtype.id} value={subtype.id}>
            {subtype.label}
          </option>
        ))}
      </select>
      <span className="block text-xs text-neutral-500 mt-1">
        Groups this on your menu, e.g. all the reds together.
      </span>
    </label>
  );
}
