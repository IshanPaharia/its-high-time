import { useEffect, useRef, useState } from "react";
import { fmtDateKey } from "../utils/dates";

export default function Grid({
  dates,
  data,
  todayKey,
  onPickDay,
  computeDayState,
  shadeFromFraction,
  showTip,
  hideTip,
  onVisibleDaysChange,
}) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(24);
  const lastReportedRef = useRef(null);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const node = containerRef.current;
    if (!node) return;

    const GAP = 6; // gap-1.5 => 0.375rem @ 16px base
    const MIN_CELL = 20;
    const MAX_CELL = 28;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect?.width ?? 0;
        if (!width) continue;

        const columns = Math.max(1, Math.floor((width + GAP) / (MIN_CELL + GAP)));
        const computedSize = (width - (columns - 1) * GAP) / columns;
        const size = Math.min(MAX_CELL, Math.max(MIN_CELL, computedSize));
        const visibleDays = columns * 7;

        setCellSize(size);

        if (lastReportedRef.current !== visibleDays) {
          lastReportedRef.current = visibleDays;
          onVisibleDaysChange?.(visibleDays);
        }
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisibleDaysChange]);

  useEffect(() => {
    if (typeof ResizeObserver !== "undefined") return;
    const fallbackDays = dates.length || 7;
    if (lastReportedRef.current !== fallbackDays) {
      lastReportedRef.current = fallbackDays;
      onVisibleDaysChange?.(fallbackDays);
    }
  }, [dates.length, onVisibleDaysChange]);

  const gridStyle = {
    gridAutoFlow: "column",
    gridTemplateRows: `repeat(7, ${cellSize}px)`,
    gridAutoColumns: `${cellSize}px`,
  };

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
      <div ref={containerRef} className="pb-1">
        <div className="grid gap-1.5" style={gridStyle}>
          {dates.map((date) => {
            const key = fmtDateKey(date); // local (no UTC drift)
            const rec = data[key] || { fixed: [false, false, false], optional: false };
            const { fraction, isGolden } = computeDayState(rec);
            const isToday = key === todayKey;

            // Empty only if ALL fixed are false AND optional is false
            const isEmpty = rec.fixed.every((v) => !v) && !rec.optional;

            const border = isGolden
              ? "border-yellow-300"
              : isEmpty
              ? "border-neutral-700"
              : "border-emerald-950/40";

            const bg = isGolden ? "bg-yellow-400" : "";
            const style = isGolden
              ? {}
              : isEmpty
              ? { background: "rgb(64 64 64)" }
              : { background: shadeFromFraction(fraction) };

            const buttonStyle = {
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              ...style,
            };

            return (
              <button
                key={key}
                onClick={() => onPickDay(key)}
                onMouseEnter={(e) => showTip(e.currentTarget, key, rec)}
                onMouseMove={(e) => showTip(e.currentTarget, key, rec)}
                onMouseLeave={hideTip}
                className={`rounded-[4px] border place-self-center transition-colors ${border} ${
                  isToday && !isGolden ? "ring-1 ring-emerald-500/70" : ""
                } ${bg}`}
                style={buttonStyle}
                aria-label={`Edit ${key}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
