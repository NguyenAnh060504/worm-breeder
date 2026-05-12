import { type Worm, createActor } from "@/backend";
import type { NewWorm, WormId } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { NewWorm, WormId, Worm };

export function useGetWorms() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["worms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorms();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useAddWorm() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newWorm: NewWorm) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.addWorm(newWorm);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["worms"] }),
  });
}

export function useDeleteWorm() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: WormId) => {
      if (!actor) throw new Error("Actor not ready");
      const res = await actor.deleteWorm(id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["worms"] }),
  });
}
export function useResetGame() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Worm> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.resetGame();
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["worms"] }),
  });
}
