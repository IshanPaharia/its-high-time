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
}) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
      <div
        className="grid grid-flow-col auto-cols-fr gap-1.5"
        style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
      >
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

          return (
            <button
              key={key}
              onClick={() => onPickDay(key)}
              onMouseEnter={(e) => showTip(e.currentTarget, key, rec)}
              onMouseMove={(e) => showTip(e.currentTarget, key, rec)}
              onMouseLeave={hideTip}
              className={`h-6 w-6 rounded-[4px] border place-self-center ${border} ${
                isToday && !isGolden ? "ring-1 ring-emerald-500/70" : ""
              } ${bg}`}
              style={style}
              aria-label={`Edit ${key}`}
            />
          );
        })}
      </div>
    </div>
  );
}
