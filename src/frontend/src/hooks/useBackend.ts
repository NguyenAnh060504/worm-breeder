/**
 * useBackend.ts — worm game state: selection, breeding, loading
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Element, MutationVariant } from "../backend";
import type { Worm, WormId } from "../backend";
import { breedWorms } from "../types";
import { useAddWorm, useDeleteWorm, useGetWorms } from "./useQueries";

export function useWormGame() {
  const { data: worms = [], isLoading } = useGetWorms();
  const addWormMut = useAddWorm();
  const deleteWormMut = useDeleteWorm();

  const [selectedIds, setSelectedIds] = useState<WormId[]>([]);
  const [isBreeding, setIsBreeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const toggleSelect = useCallback((id: WormId) => {
    setSelectedIds((prev) => {
      if (prev.some((x) => x === id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const breed = useCallback(
    async (parent1: Worm, parent2: Worm) => {
      if (worms.length >= 20) {
        toast.error("Tổ đã đầy! Hãy xóa bớt sâu để nhân giống.");
        return;
      }
      setIsBreeding(true);
      try {
        const child = breedWorms(
          parent1.element,
          parent1.head,
          parent1.body,
          parent1.tail,
          parent2.element,
          parent2.head,
          parent2.body,
          parent2.tail,
        );
        await addWormMut.mutateAsync(child);
        toast.success("🥚 Trứng nở thành công! Sâu mới đã xuất hiện!");
        setSelectedIds([]);
      } catch {
        toast.error("Nhân giống thất bại, thử lại nhé!");
      } finally {
        setIsBreeding(false);
      }
    },
    [worms.length, addWormMut],
  );

  // Self-breeding: single worm breeds with itself
  const breedSelf = useCallback(async () => {
    if (worms.length >= 20) {
      toast.error("Tổ đã đầy! Hãy xóa bớt sâu để nhân giống.");
      return;
    }
    const solo = worms[0];
    if (!solo) return;
    setIsBreeding(true);
    try {
      const child = breedWorms(
        solo.element,
        solo.head,
        solo.body,
        solo.tail,
        solo.element,
        solo.head,
        solo.body,
        solo.tail,
      );
      await addWormMut.mutateAsync(child);
      toast.success("🥚 Sâu tự lai thành công! Trứng mới đã nở!");
    } catch {
      toast.error("Nhân giống thất bại, thử lại nhé!");
    } finally {
      setIsBreeding(false);
    }
  }, [worms, addWormMut]);

  /** Selective breed: keep one locked part exactly, breed the other 2 */
  const breedSelective = useCallback(
    async (worm: Worm, lockedPart: "head" | "body" | "tail") => {
      if (worms.length >= 20) {
        toast.error("Tổ đã đầy! Hãy xóa bớt sâu để lai giữ bộ phận.");
        return;
      }
      // Pick a second parent: random OTHER worm, or self if solo
      const others = worms.filter((w) => w.id !== worm.id);
      const p2 =
        others.length > 0
          ? others[Math.floor(Math.random() * others.length)]
          : worm;

      const bred = breedWorms(
        worm.element,
        worm.head,
        worm.body,
        worm.tail,
        p2.element,
        p2.head,
        p2.body,
        p2.tail,
      );

      // Force-override the locked part with the original worm's part
      const child = {
        ...bred,
        [lockedPart]: { ...worm[lockedPart] },
      };

      setIsBreeding(true);
      try {
        await addWormMut.mutateAsync(child);
        const partNames: Record<string, string> = {
          head: "Đầu",
          body: "Thân",
          tail: "Đuôi",
        };
        toast.success(
          `🧬 Lai thành công! ${partNames[lockedPart]} được giữ lại!`,
        );
      } catch {
        toast.error("Lai giữ bộ phận thất bại, thử lại nhé!");
      } finally {
        setIsBreeding(false);
      }
    },
    [worms, addWormMut],
  );

  const deleteWorm = useCallback(
    async (id: WormId) => {
      try {
        await deleteWormMut.mutateAsync(id);
        setSelectedIds((prev) => prev.filter((x) => x !== id));
        toast.success("🗑️ Đã thả sâu về tự nhiên!");
      } catch {
        toast.error("Không xóa được sâu này!");
      }
    },
    [deleteWormMut],
  );

  /** Reset: delete all worms then add 1 starter grass worm */
  const resetGame = useCallback(async () => {
    setIsResetting(true);
    setSelectedIds([]);
    try {
      // Delete all current worms sequentially
      for (const w of worms) {
        await deleteWormMut.mutateAsync(w.id);
      }
      // Add 1 starter grass worm
      await addWormMut.mutateAsync({
        element: Element.Grass,
        head: { element: Element.Grass, mutation: MutationVariant.Solid },
        body: { element: Element.Grass, mutation: MutationVariant.Solid },
        tail: { element: Element.Grass, mutation: MutationVariant.Solid },
      });
      toast.success("🌱 Đã bắt đầu lại! Chào mừng con Sâu Cỏ mới!");
    } catch {
      toast.error("Bắt đầu lại thất bại, thử lại nhé!");
    } finally {
      setIsResetting(false);
    }
  }, [worms, addWormMut, deleteWormMut]);

  return {
    worms,
    isLoading,
    selectedIds,
    toggleSelect,
    clearSelection,
    breed,
    breedSelf,
    breedSelective,
    deleteWorm,
    isBreeding,
    resetGame,
    isResetting,
  };
}
