import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Worm } from "./backend";
import { Element } from "./backend";
import { useWormGame } from "./hooks/useBackend";
import {
  ELEMENT_META,
  MAX_WORMS,
  MUTATION_META,
  PART_LABELS,
  getWormName,
} from "./types";

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
  showTooltip?: boolean;
  isLockable?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}

function WormPart({
  element,
  mutation,
  partName,
  size = 36,
  showTooltip,
  isLockable,
  isLocked,
  onClick,
}: WormPartProps) {
  const [hovered, setHovered] = useState(false);
  const [c1, c2] = ELEMENT_COLORS[element];
  const isHead = partName === "head";
  const isTail = partName === "tail";

  // HEAD: 32×32, BODY/TAIL: 64×32
  const vbW = isHead ? 32 : 64;
  const vbH = 32;
  const svgW = isHead ? size : size * 2;
  const svgH = size;

  const patId = `p-${element}-${partName}`;
  const clipId = `clip-${element}-${partName}`;

  // TAIL: triangle — base at x=0 full height, point at (64,16)
  const tailPath = "M 0 0 L 64 16 L 0 32 Z";

  const getFill = () => {
    if (mutation === "Gradient") return `url(#${patId})`;
    if (mutation === "Striped") return `url(#${patId})`;
    if (mutation === "Metallic") return `url(#${patId})`;
    return c1;
  };

  const partLabel = PART_LABELS[partName as "head" | "body" | "tail"];
  const elemMeta = ELEMENT_META[element];

  const WrapEl = isLockable ? "button" : "span";

  return (
    <WrapEl
      {...(isLockable ? { type: "button" as const } : {})}
      className={`relative inline-flex ${isLockable ? "cursor-pointer" : ""}`}
      style={{ display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Lock indicator border */}
      {isLockable && (
        <div
          className={`absolute inset-0 rounded-lg border-2 transition-all pointer-events-none z-10 ${
            isLocked
              ? "border-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]"
              : "border-dashed border-muted-foreground/40 hover:border-cyan-300"
          }`}
          style={{ margin: "-2px" }}
        />
      )}
      {isLocked && (
        <span
          className="absolute -top-2 -right-1 text-[10px] z-20 select-none leading-none"
          style={{ pointerEvents: "none" }}
        >
          🔒
        </span>
      )}

      {/* Tooltip */}
      {(showTooltip || isLockable) && hovered && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none"
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="bg-foreground text-background text-[10px] font-semibold rounded-md px-2 py-1 shadow-lg flex items-center gap-1 animate-in fade-in duration-150">
            <span>{partLabel}</span>
            <span className="opacity-50">·</span>
            <span>{elemMeta.emoji}</span>
            <span>{elemMeta.name}</span>
            {isLockable && (
              <span className="opacity-60 ml-1">
                {isLocked ? "🔒 đã giữ" : "click để giữ"}
              </span>
            )}
          </div>
          {/* Arrow */}
          <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
        </div>
      )}

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${vbW} ${vbH}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={partName}
        style={{ display: "block" }}
      >
        <defs>
          {mutation === "Gradient" && (
            <linearGradient id={patId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c2} />
              <stop offset="100%" stopColor={c1} />
            </linearGradient>
          )}
          {mutation === "Striped" && (
            <pattern
              id={patId}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" fill={c1} />
              <rect x="0" y="0" width="4" height="8" fill={c2} opacity="0.7" />
            </pattern>
          )}
          {mutation === "Metallic" && (
            <linearGradient id={patId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="35%" stopColor={c1} />
              <stop offset="70%" stopColor={c2} />
              <stop offset="100%" stopColor={c1} stopOpacity="0.8" />
            </linearGradient>
          )}

          {/* ClipPath for each shape */}
          {isHead && (
            <clipPath id={clipId}>
              {/* D-shape: flat right at x=32, arc bulging left, radius=16, center=(32,16) */}
              <path d="M 32 0 L 32 32 A 16 16 0 0 1 0 16 Z" />
            </clipPath>
          )}
          {!isHead && !isTail && (
            <clipPath id={clipId}>
              <rect x="0" y="0" width="64" height="32" />
            </clipPath>
          )}
          {isTail && (
            <clipPath id={clipId}>
              <path d="M 0 0 L 64 16 L 0 32 Z" />
            </clipPath>
          )}
        </defs>

        {/* Base fill shape */}
        {isHead && (
          <path
            d="M 32 0 L 32 32 A 16 16 0 0 1 0 16 Z"
            fill={getFill()}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1.2"
          />
        )}
        {!isHead && !isTail && (
          <rect
            x="0"
            y="0"
            width="64"
            height="32"
            fill={getFill()}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1.2"
          />
        )}
        {isTail && (
          <path
            d={tailPath}
            fill={getFill()}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1.2"
          />
        )}

        {/* Spotted mutation overlay */}
        {mutation === "Spotted" && (
          <g clipPath={`url(#${clipId})`}>
            {isHead && (
              <path d="M 32 0 L 32 32 A 16 16 0 0 1 0 16 Z" fill={c1} />
            )}
            {!isHead && !isTail && (
              <rect x="0" y="0" width="64" height="32" fill={c1} />
            )}
            {isTail && <path d="M 0 0 L 64 16 L 0 32 Z" fill={c1} />}
            <circle
              cx={vbW * 0.3}
              cy={vbH / 2 - 2}
              r="3.5"
              fill={c2}
              opacity="0.65"
            />
            <circle
              cx={vbW * 0.55}
              cy={vbH / 2 + 3}
              r="2.5"
              fill={c2}
              opacity="0.6"
            />
            {!isHead && (
              <circle
                cx={vbW * 0.78}
                cy={vbH / 2 - 1}
                r="2"
                fill={c2}
                opacity="0.5"
              />
            )}
          </g>
        )}

        {/* Gloss highlight */}
        <rect
          x={isHead ? 4 : 2}
          y="3"
          width={isHead ? 18 : vbW - 6}
          height="9"
          rx="2"
          fill="white"
          opacity="0.18"
          clipPath={`url(#${clipId})`}
        />

        {/* HEAD: eye + half-mouth */}
        {isHead && (
          <>
            {/* Eye */}
            <circle cx="10" cy="10" r="3.2" fill="white" />
            <circle cx="10.5" cy="10" r="2" fill="#1a1a1a" />
            <circle cx="9.5" cy="9.2" r="0.7" fill="white" />
            {/* Half-mouth arc on lower-left */}
            <path
              d="M 5 20 Q 10 24 15 20"
              stroke="#1a1a1a"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </WrapEl>
  );
}

// ─── WormCard ─────────────────────────────────────────────────────────────────────────

interface WormCardProps {
  worm: Worm;
  index: number;
  isSelected: boolean;
  onSelect: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  onBreedSelective: (worm: Worm, lockedPart: "head" | "body" | "tail") => void;
  atMax: boolean;
}

function WormCard({
  worm,
  index,
  isSelected,
  onSelect,
  onDelete,
  onBreedSelective,
  atMax,
}: WormCardProps) {
  const meta = ELEMENT_META[worm.element];
  const [showDelete, setShowDelete] = useState(false);
  const [selectiveMode, setSelectiveMode] = useState(false);
  const [lockedPart, setLockedPart] = useState<"head" | "body" | "tail" | null>(
    null,
  );
  const wormName = getWormName(worm);

  const handleLockPart = (part: "head" | "body" | "tail") => {
    if (lockedPart === part) {
      // Already locked → breed now
      onBreedSelective(worm, part);
      setSelectiveMode(false);
      setLockedPart(null);
    } else {
      setLockedPart(part);
    }
  };

  const handleBreedWithLock = () => {
    if (!lockedPart) return;
    onBreedSelective(worm, lockedPart);
    setSelectiveMode(false);
    setLockedPart(null);
  };

  const cancelSelective = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectiveMode(false);
    setLockedPart(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`worm-card relative p-3 flex flex-col items-center gap-2 border-2 select-none
        ${isSelected ? "selected" : ""} ${meta.bgClass} ${meta.borderClass}`}
      onClick={() => !selectiveMode && onSelect(worm.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      data-ocid={`worm.item.${index + 1}`}
    >
      {/* Selected check */}
      {isSelected && !selectiveMode && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md z-10">
          <span className="text-primary-foreground text-xs font-bold">✓</span>
        </div>
      )}

      {/* Delete button */}
      <AnimatePresence>
        {showDelete && !selectiveMode && (
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

      {/* Worm name */}
      <div
        className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.borderClass} border ${meta.textClass} bg-card/80`}
      >
        {meta.emoji} {wormName}
      </div>

      {/* Body parts — with tooltips or lock mode */}
      <div className="flex items-center" style={{ gap: 0 }}>
        {[
          { key: "head" as const, pn: "head" },
          { key: "body" as const, pn: "body" },
          { key: "tail" as const, pn: "tail" },
        ].map(({ key, pn }) => (
          <WormPart
            key={key}
            element={worm[key].element}
            mutation={String(worm[key].mutation)}
            partName={pn}
            size={22}
            showTooltip={!selectiveMode}
            isLockable={selectiveMode}
            isLocked={lockedPart === key}
            onClick={
              selectiveMode
                ? (e?: unknown) => {
                    (e as React.MouseEvent)?.stopPropagation?.();
                    handleLockPart(key);
                  }
                : undefined
            }
          />
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
              title={PART_LABELS[part]}
            >
              {mm.emoji}
            </span>
          );
        })}
      </div>

      {/* Selective breeding UI */}
      <AnimatePresence>
        {selectiveMode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] text-center text-muted-foreground mb-1.5 font-semibold">
              {lockedPart
                ? `🔒 ${PART_LABELS[lockedPart]} đã chọn — Ấn 🧬 để lai`
                : "Chọn bộ phận muốn giữ lại"}
            </p>
            <div className="flex gap-1.5 justify-center">
              {lockedPart && (
                <button
                  type="button"
                  onClick={handleBreedWithLock}
                  disabled={atMax}
                  className="flex-1 text-[10px] font-bold py-1 px-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white transition-colors shadow disabled:opacity-50"
                  data-ocid={`worm.selective_breed_button.${index + 1}`}
                >
                  🧬 Lai!
                </button>
              )}
              <button
                type="button"
                onClick={cancelSelective}
                className="flex-1 text-[10px] font-semibold py-1 px-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors border border-border"
                data-ocid={`worm.selective_cancel_button.${index + 1}`}
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lai Giữ button — shown on hover when NOT in selective mode */}
      <AnimatePresence>
        {showDelete && !selectiveMode && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="w-full text-[10px] font-bold py-1 px-2 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white transition-all shadow-sm border border-cyan-400/40"
            onClick={(e) => {
              e.stopPropagation();
              if (atMax) {
                return;
              }
              setSelectiveMode(true);
              setLockedPart(null);
            }}
            disabled={atMax}
            title={atMax ? "Tổ đầy rồi!" : "Lai giữ 1 bộ phận"}
            data-ocid={`worm.selective_mode_button.${index + 1}`}
          >
            🧬 Lai Giữ
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ParentSlot({ worm, slot }: { worm: Worm | undefined; slot: string }) {
  if (worm) {
    const meta = ELEMENT_META[worm.element];
    const name = getWormName(worm);
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 ${meta.bgClass} ${meta.borderClass}`}
      >
        {/* Mini cylinder head preview */}
        <WormPart
          element={worm.head.element}
          mutation={String(worm.head.mutation)}
          partName="head"
          size={20}
        />
        <span
          className={`text-xs font-bold ${meta.textClass} truncate max-w-[70px]`}
        >
          {name}
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
    breedSelective,
    deleteWorm,
    isBreeding,
    resetGame,
    isResetting,
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
            {/* Reset button */}
            <button
              type="button"
              onClick={resetGame}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-destructive/60 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors disabled:opacity-50"
              title="Xóa tất cả và bắt đầu lại với 1 con Sâu Cỏ"
              data-ocid="worm.reset_button"
            >
              {isResetting ? "⏳" : "🔄"} Bắt đầu lại
            </button>
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
              <p className="text-muted-foreground font-body mb-4">
                Tổ sâu trống! Ấn nút bên dưới để bắt đầu.
              </p>
              <button
                type="button"
                onClick={resetGame}
                disabled={isResetting}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 mx-auto"
                data-ocid="worm.empty_reset_button"
              >
                {isResetting ? "⏳ Đang tạo..." : "🌱 Bắt đầu lại"}
              </button>
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
                    onBreedSelective={breedSelective}
                    atMax={atMax}
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
          © {new Date().getFullYear()}. Built with ❤ using{}
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
