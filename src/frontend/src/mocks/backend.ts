import type { backendInterface } from "../backend";
import { Element, MutationVariant } from "../backend";
import type { Worm, WormId } from "../backend";

let nextId = 5;
const worms: Worm[] = [
  {
    id: BigInt(1),
    element: Element.Electric,
    head: { element: Element.Electric, mutation: MutationVariant.Striped },
    body: { element: Element.Electric, mutation: MutationVariant.Gradient },
    tail: { element: Element.Water, mutation: MutationVariant.Solid },
  },
  {
    id: BigInt(2),
    element: Element.Earth,
    head: { element: Element.Earth, mutation: MutationVariant.Spotted },
    body: { element: Element.Grass, mutation: MutationVariant.Solid },
    tail: { element: Element.Earth, mutation: MutationVariant.Metallic },
  },
  {
    id: BigInt(3),
    element: Element.Grass,
    head: { element: Element.Grass, mutation: MutationVariant.Solid },
    body: { element: Element.Grass, mutation: MutationVariant.Striped },
    tail: { element: Element.Grass, mutation: MutationVariant.Gradient },
  },
  {
    id: BigInt(4),
    element: Element.Water,
    head: { element: Element.Water, mutation: MutationVariant.Gradient },
    body: { element: Element.Water, mutation: MutationVariant.Metallic },
    tail: { element: Element.Electric, mutation: MutationVariant.Spotted },
  },
];

export const mockBackend: backendInterface = {
  getWorms: async () => [...worms],

  addWorm: async (newWorm) => {
    const id = BigInt(nextId++);
    worms.push({ id, ...newWorm });
    return { __kind__: "ok", ok: id as WormId };
  },

  deleteWorm: async (id) => {
    const idx = worms.findIndex((w) => w.id === id);
    if (idx === -1) return { __kind__: "err", err: "Not found" };
    worms.splice(idx, 1);
    return { __kind__: "ok", ok: null };
  },
};
