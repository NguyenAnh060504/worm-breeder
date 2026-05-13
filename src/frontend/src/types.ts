import { Element, MutationVariant } from "./backend";
export { Element, MutationVariant };
export type { BodyPart, Worm, NewWorm, WormId } from "./backend";

// ─── Display helpers ──────────────────────────────────────────────────────────

export const ELEMENT_META: Record<
  Element,
  {
    name: string;
    emoji: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }
> = {
  [Element.Electric]: {
    name: "Sâu Sét",
    emoji: "⚡",
    bgClass: "bg-[oklch(var(--worm-electric)/0.12)]",
    borderClass: "border-[oklch(var(--worm-electric))]",
    textClass: "text-[oklch(var(--worm-electric-dark))]",
  },
  [Element.Earth]: {
    name: "Sâu Đất",
    emoji: "🌿",
    bgClass: "bg-[oklch(var(--worm-earth)/0.12)]",
    borderClass: "border-[oklch(var(--worm-earth))]",
    textClass: "text-[oklch(var(--worm-earth))]",
  },
  [Element.Grass]: {
    name: "Sâu Cỏ",
    emoji: "🍃",
    bgClass: "bg-[oklch(var(--worm-grass)/0.12)]",
    borderClass: "border-[oklch(var(--worm-grass))]",
    textClass: "text-[oklch(var(--worm-grass))]",
  },
  [Element.Water]: {
    name: "Sâu Nước",
    emoji: "💧",
    bgClass: "bg-[oklch(var(--worm-water)/0.12)]",
    borderClass: "border-[oklch(var(--worm-water))]",
    textClass: "text-[oklch(var(--worm-water))]",
  },
};

export const MUTATION_META: Record<
  MutationVariant,
  { name: string; emoji: string }
> = {
  [MutationVariant.Solid]: { name: "Đặc", emoji: "⬛" },
  [MutationVariant.Striped]: { name: "Sọc", emoji: "🟧" },
  [MutationVariant.Spotted]: { name: "Chấm", emoji: "🟡" },
  [MutationVariant.Gradient]: { name: "Dải Màu", emoji: "🌈" },
  [MutationVariant.Metallic]: { name: "Kim Loại", emoji: "✨" },
};

export const ALL_ELEMENTS: Element[] = [
  Element.Electric,
  Element.Earth,
  Element.Grass,
  Element.Water,
];

export const ALL_MUTATIONS: MutationVariant[] = [
  MutationVariant.Solid,
  MutationVariant.Striped,
  MutationVariant.Spotted,
  MutationVariant.Gradient,
  MutationVariant.Metallic,
];

function randElement(): Element {
  return ALL_ELEMENTS[Math.floor(Math.random() * ALL_ELEMENTS.length)];
}

function randMutation(): MutationVariant {
  return ALL_MUTATIONS[Math.floor(Math.random() * ALL_MUTATIONS.length)];
}

/** 50/50 inherit per part, 15% chance full random mutation */
export function breedWorms(
  p1Element: Element,
  p1Head: { element: Element; mutation: MutationVariant },
  p1Body: { element: Element; mutation: MutationVariant },
  p1Tail: { element: Element; mutation: MutationVariant },
  p2Element: Element,
  p2Head: { element: Element; mutation: MutationVariant },
  p2Body: { element: Element; mutation: MutationVariant },
  p2Tail: { element: Element; mutation: MutationVariant },
): {
  element: Element;
  head: { element: Element; mutation: MutationVariant };
  body: { element: Element; mutation: MutationVariant };
  tail: { element: Element; mutation: MutationVariant };
} {
  const pick = <T>(a: T, b: T): T => (Math.random() < 0.5 ? a : b);
  const mutate = <T>(a: T, b: T, rand: () => T): T =>
    Math.random() < 0.15 ? rand() : pick(a, b);

  return {
    element: mutate(p1Element, p2Element, randElement),
    head: {
      element: mutate(p1Head.element, p2Head.element, randElement),
      mutation: mutate(p1Head.mutation, p2Head.mutation, randMutation),
    },
    body: {
      element: mutate(p1Body.element, p2Body.element, randElement),
      mutation: mutate(p1Body.mutation, p2Body.mutation, randMutation),
    },
    tail: {
      element: mutate(p1Tail.element, p2Tail.element, randElement),
      mutation: mutate(p1Tail.mutation, p2Tail.mutation, randMutation),
    },
  };
}

export const MAX_WORMS = 20;

/** Returns the worm's display name based on element purity */
export function getWormName(worm: {
  id: bigint;
  head: { element: Element };
  body: { element: Element };
  tail: { element: Element };
}): string {
  if (
    worm.head.element === worm.body.element &&
    worm.body.element === worm.tail.element
  ) {
    const names: Record<Element, string> = {
      [Element.Electric]: "Sâu Sét",
      [Element.Earth]: "Sâu Đất",
      [Element.Grass]: "Sâu Cỏ",
      [Element.Water]: "Sâu Nước",
    };
    return names[worm.head.element];
  }
  return `Sâu #${worm.id}`;
}
