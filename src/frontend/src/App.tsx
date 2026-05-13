import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { memo } from "react";
import type { Worm } from "./backend";
import { Element } from "./backend";
import { useWormGame } from "./hooks/useBackend";
import { ELEMENT_META, MAX_WORMS, getWormName } from "./types";

const queryClient = new QueryClient();

// ─── WormCard ────────────────────────────────────────────────────────────────

interface WormCardProps {
  worm: Worm;
  index: number;
  isSelected: boolean;
  onSelect: (id: bigint) => void;
  onDelete: (id: bigint) => void;
}

const WormCard = memo(function WormCard({
  worm,
  index,
  isSelected,
  onSelect,
  onDelete,
}: WormCardProps) {
  const meta = ELEMENT_META[worm.element];
  const name = getWormName(worm);

  return (
    <div
      className={`worm-card border-2 ${
        isSelected ? `selected ${meta.borderClass}` : "border-border"
      } bg-card rounded-2xl p-3 flex flex-col gap-2`}
      data-ocid={`worm.item.${index + 1}`}
    >
      {/* Header row: name + delete */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-black truncate">
          {meta.emoji} {name}
        </span>
        <button
          type="button"
          onClick={() => onDelete(worm.id)}
          aria-label="Xóa sâu"
          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold flex-shrink-0"
          data-ocid={`worm.delete_button.${index + 1}`}
        >
          ×
        </button>
      </div>

      {/* Image placeholder */}
      <button
        type="button"
        onClick={() => onSelect(worm.id)}
        className={`w-full h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-xs text-black/40 font-medium ${
          isSelected
            ? `${meta.borderClass} ${meta.bgClass}`
            : "border-border bg-muted/30"
        }`}
        data-ocid={`worm.select_button.${index + 1}`}
      >
        {isSelected ? "✓ Đã chọn" : "Hình ảnh"}
      </button>
    </div>
  );
});

// ─── AppInner ─────────────────────────────────────────────────────────────────

function AppInner() {
  const {
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
  } = useWormGame();

  const wormCount = worms.length;
  const atMax = wormCount >= MAX_WORMS;
  const isSoloMode = wormCount === 1;
  const twoSelected = selectedIds.length === 2;
  const canBreed = twoSelected || isSoloMode;

  const p1 = worms.find((w) => w.id === selectedIds[0]);
  const p2 = twoSelected
    ? worms.find((w) => w.id === selectedIds[1])
    : undefined;

  const handleBreed = () => {
    if (isSoloMode) {
      breedSelf();
    } else if (p1 && p2) {
      breed(p1, p2);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b-2 border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐛</span>
            <h1 className="text-lg font-extrabold text-black leading-tight">
              Worm Breeder
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Restart — only after data loaded and worms exist */}
            {!isLoading && worms.length > 0 && (
              <button
                type="button"
                onClick={resetGame}
                disabled={isResetting}
                className="px-3 py-1.5 rounded-full border-2 border-red-300 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                data-ocid="worm.reset_button"
              >
                {isResetting ? "⏳" : "🔄"} Bắt đầu lại
              </button>
            )}

            {/* Counter */}
            <div
              className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold ${
                atMax
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-border bg-muted/50 text-black"
              }`}
              data-ocid="worm.counter"
            >
              {wormCount}/{MAX_WORMS} con sâu
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-5">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="worm.loading_state"
          >
            <div className="text-5xl">🥚</div>
            <p className="text-base font-bold text-black">Đang tải tổ sâu...</p>
          </div>
        ) : worms.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="worm.empty_state"
          >
            <div className="text-5xl">🐣</div>
            <p className="text-lg font-bold text-black">Không có sâu nào</p>
            <p className="text-sm text-black/60">Bấm nút dưới đây để bắt đầu</p>
            <button
              type="button"
              onClick={resetGame}
              disabled={isResetting}
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-black/80 disabled:opacity-50"
              data-ocid="worm.empty_reset_button"
            >
              {isResetting ? "⏳ Đang tạo..." : "🌱 Bắt đầu lại"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {worms.map((worm, idx) => (
              <WormCard
                key={String(worm.id)}
                worm={worm}
                index={idx}
                isSelected={selectedIds.some((id) => id === worm.id)}
                onSelect={toggleSelect}
                onDelete={deleteWorm}
              />
            ))}
          </div>
        )}
      </main>

      {/* Breeding section */}
      {!isLoading && worms.length > 0 && (
        <div className="sticky bottom-0 bg-card border-t-2 border-border z-30">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Status text */}
            <div className="flex-1 text-sm text-black">
              {isSoloMode ? (
                <span>🔁 Chỉ 1 con — có thể tự lai!</span>
              ) : twoSelected ? (
                <span>
                  ✓ Đã chọn: <strong>{getWormName(p1 ?? worms[0])}</strong>
                  {" + "}
                  <strong>{p2 ? getWormName(p2) : "?"}</strong>
                </span>
              ) : selectedIds.length === 1 ? (
                <span>Chọn thêm 1 con sâu nữa để lai giống</span>
              ) : (
                <span className="text-black/50">
                  Chọn 2 con sâu để lai giống
                </span>
              )}
            </div>

            {/* Breed button */}
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-3 py-2 rounded-full border border-border text-xs font-semibold text-black hover:bg-muted"
                  data-ocid="worm.deselect_button"
                >
                  Hủy
                </button>
              )}
              <button
                type="button"
                onClick={handleBreed}
                disabled={!canBreed || isBreeding || atMax}
                className="px-5 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed"
                data-ocid="worm.breed_button"
              >
                {isBreeding
                  ? "⏳ Đang ấp..."
                  : isSoloMode
                    ? "🔁 Tự Lai"
                    : "🥚 Lai Giống"}
              </button>
            </div>
          </div>

          {atMax && (
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <p className="text-xs text-red-500 font-semibold">
                🔴 Tổ đầy 20 con! Xóa bớt để nhân giống tiếp.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-3 text-center">
        <p className="text-xs text-black/40">
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black/70"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Element legend — visible in header area below main header */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
