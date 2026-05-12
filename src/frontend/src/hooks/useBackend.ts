/**
 * useBackend.ts — worm game state: selection, breeding, loading
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Worm, WormId } from "../backend";
import { breedWorms } from "../types";
import { useAddWorm, useDeleteWorm, useGetWorms } from "./useQueries";

export function useWormGame() {
  const { data: worms = [], isLoading } = useGetWorms();
  const addWormMut = useAddWorm();
  const deleteWormMut = useDeleteWorm();

  const [selectedIds, setSelectedIds] = useState<WormId[]>([]);
  const [isBreeding, setIsBreeding] = useState(false);

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

  return {
    worms,
    isLoading,
    selectedIds,
    toggleSelect,
    clearSelection,
    breed,
    breedSelf,
    deleteWorm,
    isBreeding,
  };
}
