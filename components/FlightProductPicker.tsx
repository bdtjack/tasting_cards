"use client";

import { useState } from "react";
import type { PickerProduct } from "@/lib/menuGroups";

/**
 * Chooses which products are in a preset flight and in what order guests
 * see them (e.g. lightest to boldest). Submits one hidden `productIds`
 * input per selected product, in order — the server keeps that order.
 *
 * Products already in the flight stay listed even if they've since been
 * archived (marked "Sold out"), so saving the flight never silently drops
 * them; only published products can be newly added. The "add" list is
 * grouped like the guest menu (Wine → Red / White …); `products` arrives
 * already in that order (see toPickerProducts in lib/menuGroups.ts).
 */
export default function FlightProductPicker({
  products,
  initialSelectedIds,
}: {
  products: PickerProduct[];
  initialSelectedIds: string[];
}) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const [selected, setSelected] = useState<string[]>(
    initialSelectedIds.filter((id) => byId.has(id))
  );

  const available = products.filter(
    (product) => product.status === "PUBLISHED" && !selected.includes(product.id)
  );

  function move(index: number, delta: number) {
    setSelected((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {selected.map((id) => (
        <input key={id} type="hidden" name="productIds" value={id} />
      ))}

      <div>
        <p className="text-xs text-neutral-500 mb-2">
          In this flight, in the order guests see them
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-neutral-400 border border-dashed border-neutral-300 rounded-md px-3 py-3">
            Nothing yet — add products below.
          </p>
        ) : (
          <ol className="space-y-2">
            {selected.map((id, index) => {
              const product = byId.get(id)!;
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 text-sm border border-neutral-300 bg-white rounded-md px-3 py-2"
                >
                  <span className="text-neutral-400 w-5">{index + 1}.</span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">
                      {product.name}
                      {product.status === "ARCHIVED" && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                          Sold out
                        </span>
                      )}
                    </span>
                    <span className="block text-neutral-400 text-xs truncate">
                      {product.group ? `${product.group} · ` : ""}
                      {product.section}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${product.name} up`}
                    className="px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === selected.length - 1}
                    aria-label={`Move ${product.name} down`}
                    className="px-2 py-1 rounded border border-neutral-200 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected((current) => current.filter((x) => x !== id))}
                    className="px-2 py-1 text-neutral-500 text-xs"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {available.length > 0 && (
        <div>
          <p className="text-xs text-neutral-500 mb-2">Add a published product</p>
          <div className="space-y-4">
            {groupConsecutive(available, (product) => product.section).map(([section, inSection]) => (
              <div key={section}>
                <p className="text-sm font-medium text-neutral-700 mb-1.5">{section}</p>
                <div className="space-y-2">
                  {groupConsecutive(inSection, (product) => product.group ?? "").map(([group, inGroup]) => (
                    <div key={group || "all"}>
                      {group && (
                        <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                          {group}
                        </p>
                      )}
                      <div className="space-y-1.5">
                        {inGroup.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => setSelected((current) => [...current, product.id])}
                            className="w-full flex items-center gap-2.5 text-left text-sm border border-neutral-200 bg-white rounded-md px-3 py-2 hover:border-neutral-400"
                          >
                            <span className="text-neutral-400">+</span>
                            <span>{product.name}</span>
                            <span className="text-neutral-400 text-xs">{product.category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Splits an already-ordered list into runs that share the same key, keeping order. */
function groupConsecutive<T>(items: T[], keyOf: (item: T) => string): [string, T[]][] {
  const runs: [string, T[]][] = [];
  for (const item of items) {
    const key = keyOf(item);
    const last = runs[runs.length - 1];
    if (last && last[0] === key) last[1].push(item);
    else runs.push([key, [item]]);
  }
  return runs;
}
