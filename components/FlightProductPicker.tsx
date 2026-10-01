"use client";

import { useState } from "react";

export type PickerProduct = {
  id: string;
  name: string;
  category: string;
  status: string;
};

/**
 * Chooses which products are in a preset flight and in what order guests
 * see them (e.g. lightest to boldest). Submits one hidden `productIds`
 * input per selected product, in order — the server keeps that order.
 *
 * Products already in the flight stay listed even if they've since been
 * archived (marked "Sold out"), so saving the flight never silently drops
 * them; only published products can be newly added.
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
                  <span className="flex-1 min-w-0 truncate">
                    {product.name}{" "}
                    <span className="text-neutral-400 text-xs">{product.category}</span>
                    {product.status === "ARCHIVED" && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                        Sold out
                      </span>
                    )}
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
          <div className="space-y-2">
            {available.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelected((current) => [...current, product.id])}
                className="w-full flex items-center gap-2.5 text-left text-sm border border-neutral-200 rounded-md px-3 py-2 hover:border-neutral-400"
              >
                <span className="text-neutral-400">+</span>
                <span>{product.name}</span>
                <span className="text-neutral-400 text-xs">{product.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
