import { useQueryClient } from "@tanstack/react-query";
/**
 * useBackend.ts — worm game state: selection, breeding, loading
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Worm, WormId } from "../backend";
import { breedWorms } from "../types";
import {
  useAddWorm,
  useDeleteWorm,
  useGetWorms,
  useResetGame,
} from "./useQueries";

export function useWormGame() {
  const { data: worms = [], isLoading } = useGetWorms();
  const addWormMut = useAddWorm();
  const deleteWormMut = useDeleteWorm();
  const resetGameMut = useResetGame();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<WormId[]>([]);
  const [isBreeding, setIsBreeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  // Keep a ref to the latest worms so the interval always sees fresh data
  const wormsRef = useRef(worms);
  useEffect(() => {
    wormsRef.current = worms;
  }, [worms]);

  const toggleSelect = useCallback((id: WormId) => {
    setSelectedIds((prev) => {
      if (prev.some((x) => x === id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);
  // Auto-breed every 10 seconds
  useEffect(() => {
    if (isLoading) return;
    const intervalId = setInterval(async () => {
      const current = wormsRef.current;
      if (current.length >= 20) return;
      if (current.length === 1) {
        const solo = current[0];
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
        try {
          await addWormMut.mutateAsync(child);
        } catch {
          /* silent */
        }
      } else if (current.length >= 2) {
        const i = Math.floor(Math.random() * current.length);
        let j = Math.floor(Math.random() * (current.length - 1));
        if (j >= i) j++;
        const p1 = current[i];
        const p2 = current[j];
        const child = breedWorms(
          p1.element,
          p1.head,
          p1.body,
          p1.tail,
          p2.element,
          p2.head,
          p2.body,
          p2.tail,
        );
        try {
          await addWormMut.mutateAsync(child);
        } catch {
          /* silent */
        }
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [isLoading, addWormMut]);

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

  /** Self-breeding: single worm breeds with itself */
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

  const resetGame = useCallback(async () => {
    setSelectedIds([]);
    setIsResetting(true);
    try {
      await resetGameMut.mutateAsync();
      toast.success("🌱 Đã bắt đầu lại! Chào mừng con Sâu Cỏ mới!");
    } catch (err) {
      console.error("[resetGame] failed:", err);
      toast.error("Bắt đầu lại thất bại, thử lại nhé!");
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["worms"] });
      setIsResetting(false);
    }
  }, [resetGameMut, queryClient]);

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
    resetGame,
    isResetting,
  };
}
