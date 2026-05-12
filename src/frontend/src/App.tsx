import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Worm } from "./backend";
import { Element } from "./backend";
import { useWormGame } from "./hooks/useBackend";
import { ELEMENT_META, MAX_WORMS, MUTATION_META, PART_LABELS } from "./types";

const queryClient = new QueryClient();

// ─── WormBody SVG ──────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<Element, [string, string]> = {
  [Element.Electric]: ["#ffe234", "#4a90e2"],
  [Element.Earth]: ["#a0522d", "#7cbc40"],
  [Element.Grass]: ["#4caf50", "#a5d6a7"],
  [Element.Water]: ["#29b6f6", "#b3e5fc"],
};

interface WormPartProps {
  element: Element;
  mutation: string;
  partName: string;
  size?: number;
}

function WormPart({ element, mutation, partName, size = 36 }: WormPartProps) {
  const [c1, c2] = ELEMENT_COLORS[element];
  const isHead = partName === "head";
  const isTail = partName === "tail";

  const getFill = () => {
    if (mutation === "Gradient") return `url(#grad-${element}-${partName})`;
    if (mutation === "Striped") return `url(#stripe-${element}-${partName})`;
    if (mutation === "Spotted") return c1;
    if (mutation === "Metallic") return `url(#metal-${element}-${partName})`;
    return c1;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={partName}
    >
      <defs>
        <radialGradient id={`grad-${element}-${partName}`} cx="40%" cy="40%">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
        <pattern
          id={`stripe-${element}-${partName}`}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <rect width="6" height="6" fill={c2} />
          <path d="M0 6L6 0M-1 1L1-1M5 7L7 5" stroke={c1} strokeWidth="2" />
        </pattern>
        <linearGradient
          id={`metal-${element}-${partName}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="40%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>

      {isHead ? (
        <>
          <ellipse
            cx="20"
            cy="22"
            rx="15"
            ry="14"
            fill={getFill()}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
          {/* eyes */}
          <circle cx="14" cy="18" r="3.5" fill="white" />
          <circle cx="26" cy="18" r="3.5" fill="white" />
          <circle cx="15" cy="18" r="2" fill="#222" />
          <circle cx="27" cy="18" r="2" fill="#222" />
          <circle cx="15.5" cy="17" r="0.8" fill="white" />
          <circle cx="27.5" cy="17" r="0.8" fill="white" />
          {/* smile */}
          <path
            d="M14 25 Q20 30 26 25"
            stroke="#222"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          {mutation === "Spotted" && (
            <>
              <circle cx="10" cy="25" r="2" fill={c2} opacity="0.7" />
              <circle cx="30" cy="23" r="2" fill={c2} opacity="0.7" />
            </>
          )}
        </>
      ) : isTail ? (
        <>
          <ellipse
            cx="20"
            cy="22"
            rx="10"
            ry="13"
            fill={getFill()}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="20"
            cy="33"
            rx="5"
            ry="6"
            fill={getFill()}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1"
          />
          {mutation === "Spotted" && (
            <circle cx="20" cy="20" r="2.5" fill={c2} opacity="0.7" />
          )}
        </>
      ) : (
        <>
          <rect
            x="6"
            y="8"
            width="28"
            height="24"
            rx="10"
            fill={getFill()}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1.5"
          />
          {mutation === "Spotted" && (
            <>
              <circle cx="13" cy="18" r="3" fill={c2} opacity="0.6" />
              <circle cx="27" cy="22" r="2.5" fill={c2} opacity="0.6" />
            </>
          )}
          {mutation === "Striped" && (
            <line
              x1="6"
              y1="18"
              x2="34"
              y2="18"
              stroke={c2}
              strokeWidth="3"
              opacity="0.5"
            />
          )}
        </>
      )}
    </svg>
  );
}

// ─── WormCard ─────────────────────────────────────────────────────────────────────────

interface WormCardProps {
  worm: Worm;
  index: number;
  isSelected: boolean;
  onSelect: (id: bigint) => void;
  onDelete: (id: bigint) => void;
}

function WormCard({
  worm,
  index,
  isSelected,
  onSelect,
  onDelete,
}: WormCardProps) {
  const meta = ELEMENT_META[worm.element];
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`worm-card relative p-3 flex flex-col items-center gap-2 border-2 select-none
        ${isSelected ? "selected" : ""} ${meta.bgClass} ${meta.borderClass}`}
      onClick={() => onSelect(worm.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      data-ocid={`worm.item.${index + 1}`}
    >
      {/* Selected check */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md z-10">
          <span className="text-primary-foreground text-xs font-bold">✓</span>
        </div>
      )}

      {/* Delete button */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute top-2 left-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-md z-10 text-white hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(worm.id);
            }}
            aria-label="Xóa sâu"
            data-ocid={`worm.delete_button.${index + 1}`}
          >
            <span className="text-xs font-bold leading-none">×</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Element badge */}
      <div
        className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.borderClass} border ${meta.textClass} bg-card/80`}
      >
        {meta.emoji} {meta.name}
      </div>

      {/* Body parts row */}
      <div className="flex items-center gap-1.5">
        {(["head", "body", "tail"] as const).map((part) => (
          <div key={part} className="flex flex-col items-center gap-0.5">
            <div className="body-part w-10 h-10 p-0.5">
              <WormPart
                element={worm[part].element}
                mutation={worm[part].mutation}
                partName={part}
                size={32}
              />
            </div>
            <span className="text-[9px] font-semibold text-muted-foreground">
              {PART_LABELS[part]}
            </span>
          </div>
        ))}
      </div>

      {/* Mutation badges */}
      <div className="flex items-center gap-1">
        {(["head", "body", "tail"] as const).map((part) => {
          const mm = MUTATION_META[worm[part].mutation];
          return (
            <span
              key={part}
              className="text-[10px] bg-card/70 border border-border rounded-full px-1.5 py-0.5 font-medium"
            >
              {mm.emoji}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

function ParentSlot({ worm, slot }: { worm: Worm | undefined; slot: string }) {
  if (worm) {
    const meta = ELEMENT_META[worm.element];
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 ${meta.bgClass} ${meta.borderClass}`}
      >
        <WormPart
          element={worm.head.element}
          mutation={worm.head.mutation}
          partName="head"
          size={24}
        />
        <span
          className={`text-xs font-bold ${meta.textClass} truncate max-w-[70px]`}
        >
          {meta.name}
        </span>
      </div>
    );
  }
  return (
    <div
      data-slot={slot}
      className="flex items-center justify-center w-16 h-10 rounded-xl border-2 border-dashed border-border text-muted-foreground text-xs"
    >
      ?
    </div>
  );
}

// ─── BreedingPanel ────────────────────────────────────────────────────────────────────

interface BreedingPanelProps {
  worms: Worm[];
  selectedIds: bigint[];
  onBreed: (p1: Worm, p2: Worm) => void;
  onBreedSelf: () => void;
  onClear: () => void;
  isBreeding: boolean;
  atMax: boolean;
  isSoloMode: boolean;
}

function BreedingPanel({
  worms,
  selectedIds,
  onBreed,
  onBreedSelf,
  onClear,
  isBreeding,
  atMax,
  isSoloMode,
}: BreedingPanelProps) {
  const p1 = worms.find((w) => w.id === selectedIds[0]);
  const p2 = isSoloMode ? p1 : worms.find((w) => w.id === selectedIds[1]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
    >
      <div className="bg-card border-t-2 border-primary shadow-xl px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              {isSoloMode ? "Tự lai:" : "Nhân giống:"}
            </span>
            <ParentSlot worm={p1} slot="parent-1" />
            {isSoloMode ? (
              <span className="text-lg" title="Tự lai với chính mình">
                🔁
              </span>
            ) : null}
            <ParentSlot worm={p2} slot="parent-2" />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {atMax && (
              <span className="text-xs text-destructive font-semibold">
                🔴 Tổ đầy!
              </span>
            )}
            {isSoloMode ? (
              <button
                type="button"
                onClick={onBreedSelf}
                disabled={isBreeding || atMax}
                className="breed-button text-sm"
                data-ocid="worm.breed_self_button"
              >
                {isBreeding ? (
                  <span className="flex items-center gap-1.5">
                    ⏳ Đang ấp...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">🔁 Tự Lai</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => p1 && p2 && onBreed(p1, p2)}
                disabled={!p1 || !p2 || isBreeding || atMax}
                className="breed-button text-sm"
                data-ocid="worm.breed_button"
              >
                {isBreeding ? (
                  <span className="flex items-center gap-1.5">
                    ⏳ Đang ấp...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    🥚 Nhân Giống
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 rounded-full border-2 border-border text-sm font-semibold text-foreground/70 hover:bg-muted transition-all"
              data-ocid="worm.deselect_button"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AppInner ───────────────────────────────────────────────────────────────────────

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
  } = useWormGame();
  const wormCount = worms.length;
  const atMax = wormCount >= MAX_WORMS;
  const isSoloMode = wormCount === 1;
  const twoSelected = selectedIds.length === 2;
  // Show breeding panel: 2 selected OR only 1 worm in nest (auto self-breed)
  const showBreedPanel = twoSelected || isSoloMode;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b-2 border-border shadow-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse-glow">🐛</span>
            <div>
              <h1 className="font-display text-xl font-extrabold text-foreground leading-tight">
                Sâu Ma Thuật
              </h1>
              <p className="text-xs text-foreground/50 font-body">
                {isSoloMode
                  ? "Chỉ 1 con → tự lai để tạo biến thể mới!"
                  : "Chọn 2 con sâu → nhân giống biến thể mới!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Worm count */}
            <div
              className={`rounded-2xl px-4 py-2 border-2 text-center ${
                atMax
                  ? "bg-destructive/10 border-destructive"
                  : "bg-primary/10 border-primary/40"
              }`}
              data-ocid="worm.counter"
            >
              <span
                className={`text-xl font-extrabold leading-none font-display ${atMax ? "text-destructive" : "text-primary"}`}
              >
                {wormCount}
              </span>
              <span className="text-foreground/50 font-bold text-sm">
                {" "}
                / {MAX_WORMS}
              </span>
              <div
                className={`text-[10px] font-body mt-0.5 ${atMax ? "text-destructive" : "text-muted-foreground"}`}
              >
                {atMax ? "🔴 Tổ đầy!" : "🥚 Tổ Sâu"}
              </div>
            </div>

            {/* Progress bar */}
            <div className="hidden sm:block w-28">
              <div className="text-[10px] text-muted-foreground mb-1 font-body text-right">
                {wormCount}/{MAX_WORMS}
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(wormCount / MAX_WORMS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Element type filter legend */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex items-center gap-2 flex-wrap">
          {Object.values(Element).map((el) => {
            const m = ELEMENT_META[el];
            const count = worms.filter((w) => w.element === el).length;
            return (
              <div
                key={el}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${m.bgClass} ${m.borderClass} ${m.textClass}`}
              >
                <span>{m.emoji}</span>
                <span>{m.name}</span>
                <span className="bg-card/80 rounded-full px-1.5 py-0 font-bold">
                  {count}
                </span>
              </div>
            );
          })}
          {selectedIds.length > 0 && (
            <div className="ml-auto text-xs text-primary font-bold bg-primary/10 border border-primary/30 rounded-full px-3 py-1">
              {isSoloMode
                ? "✓ Sẵn sàng tự lai!"
                : `✓ Đã chọn ${selectedIds.length}/2 con`}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="worm.loading_state"
          >
            <div className="text-6xl animate-bounce">🥚</div>
            <p className="font-bold text-foreground/60 font-display text-lg">
              Đang thức dậy tổ sâu...
            </p>
          </div>
        ) : worms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-6"
            data-ocid="worm.empty_state"
          >
            <img
              src="/assets/generated/worm-nest-hero.dim_800x400.png"
              alt="Tổ sâu trống"
              className="w-64 h-auto rounded-3xl shadow-lg opacity-80"
            />
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-foreground mb-2">
                🐣 Tổ còn trống!
              </h2>
              <p className="text-muted-foreground font-body">
                App đang kết nối với tổ sâu...
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4 font-body">
              {isSoloMode
                ? "✨ Chỉ có 1 con! Ấn vào sâu để chọn → tự lai với chính nó 🔁"
                : "✨ Ấn vào sâu để chọn làm bố/mẹ • Hover sâu và ấn × để xóa"}
            </p>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            >
              <AnimatePresence mode="popLayout">
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
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-3 text-center z-10">
        <p className="text-xs text-foreground/40 font-body">
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Breeding panel */}
      <AnimatePresence>
        {showBreedPanel && (
          <BreedingPanel
            worms={worms}
            selectedIds={isSoloMode && worms[0] ? [worms[0].id] : selectedIds}
            onBreed={breed}
            onBreedSelf={breedSelf}
            onClear={clearSelection}
            isBreeding={isBreeding}
            atMax={atMax}
            isSoloMode={isSoloMode}
          />
        )}
      </AnimatePresence>

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
