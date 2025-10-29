import React, { useEffect, useMemo, useState } from "react";

// Utils & client
import { fmtDateKey, parseDateKey, todayKey as tk, generateDateRange } from "./utils/dates";
import { computeDayState, shadeFromFraction } from "./utils/progress";
import { supabase } from "./lib/supabaseClient";

// Components
import Header from "./components/Header";
import CounterCards from "./components/CounterCards";
import Legend from "./components/Legend";
import Grid from "./components/Grid";
import DayEditor from "./components/DayEditor";
import Tooltip from "./components/Tooltip";
import Modal from "./components/Modal";
import AdminButton from "./components/AdminButton";
import { AuthBox } from "./components/AuthBox";

// Hooks
import { useStableToday } from "./hooks/useStableToday";
import { useCountdown } from "./hooks/useCountdown";
import { useDirtyKeys } from "./hooks/useDirtyKeys";

// ====== CONFIG ======
const OWNER_UUID = import.meta.env.VITE_OWNER_UUID;
if (!OWNER_UUID) console.error("Missing VITE_OWNER_UUID in environment");

const TASK_LABELS = ["Do LeetCode", "Work on projects", "Learn tech-related stuff"];

// ====== APP ======
export default function App() {
  // Model: { [dateKey]: { fixed:[b,b,b], optional:b, optionalText:string } }
  const [data, setData] = useState({});
  const [selectedKey, setSelectedKey] = useState(tk());
  const [target, setTarget] = useState(null);

  // Fixed range: 182 days
  const [daysToShow] = useState(182);

  // Save state + owner detection
  const [saveState, setSaveState] = useState("readonly"); // "readonly" | "saving" | "saved" | "error"
  const [isOwner, setIsOwner] = useState(false);

  // Stable "today" (only changes when the calendar day rolls)
  const { todayKey, endDate } = useStableToday();

  const start = useMemo(() => {
    const s = new Date(endDate);
    s.setDate(s.getDate() - (daysToShow - 1));
    return s;
  }, [daysToShow, endDate]);

  const dates = useMemo(() => generateDateRange(start, endDate), [start, endDate]);

  // Tooltip
  const [tip, setTip] = useState(null);
  const showTip = (el, key, rec) => {
    const rect = el.getBoundingClientRect();
    const spacing = 12;
    let x = rect.left + rect.width / 2;
    let y = rect.top + window.scrollY - spacing;
    if (rect.top < 80) y = rect.bottom + window.scrollY + spacing;
    setTip({ x, y, content: renderTipContent(key, rec) });
  };
  const hideTip = () => setTip(null);

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);

  // Dirty lock to prevent fetch from clobbering in-flight edits
  const { dirtyKeys, markDirty, clearDirtyLater } = useDirtyKeys();

  // ---- Auth listener: set owner/readonly + initial save state ----
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const owner = !!data.user && data.user.id === OWNER_UUID;
      setIsOwner(owner);
      setSaveState(owner ? "saved" : "readonly");
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Supabase: load entries for the visible window ----
  useEffect(() => {
    (async () => {
      const { data: rows, error } = await supabase
        .from("entries")
        .select("*")
        .gte("day", fmtDateKey(start))
        .lte("day", fmtDateKey(endDate));

      if (error) {
        console.error(error);
        return;
      }

      const merged = {};
      for (const r of rows || []) {
        merged[r.day] = {
          fixed: [r.fixed1, r.fixed2, r.fixed3],
          optional: r.optional,
          optionalText: r.optional_text || "",
        };
      }

      setData((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(merged)) {
          if (!dirtyKeys.has(k)) next[k] = v;
        }
        return next;
      });
    })();
  }, [daysToShow, todayKey]); // stable deps (no Date() thrash)

  // ---- Supabase: load + save target date ----
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "target_date")
        .maybeSingle();
      if (!error && data?.value) setTarget(new Date(data.value));
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || user.id !== OWNER_UUID) return;
      if (!target) return;
      await supabase
        .from("settings")
        .upsert({ key: "target_date", value: target.toISOString(), updated_at: new Date().toISOString() });
    })();
  }, [target]);

  // ---- Save helper with small retry ----
  async function saveEntry(dayKey, updated) {
    if (!isOwner) return; // read-only viewer
    setSaveState("saving");
    const payload = {
      user_id: OWNER_UUID,
      day: dayKey,
      fixed1: !!updated.fixed[0],
      fixed2: !!updated.fixed[1],
      fixed3: !!updated.fixed[2],
      optional: !!updated.optional,
      optional_text: updated.optionalText ?? "",
      updated_at: new Date().toISOString(),
    };
    const attempt = async () => supabase.from("entries").upsert(payload, { onConflict: "day" });
    let { error } = await attempt();
    if (error) {
      await new Promise((r) => setTimeout(r, 400));
      ({ error } = await attempt());
    }
    setSaveState(error ? "error" : "saved");
    if (error) console.error("Save failed:", error.message);
  }

  // ---- Edit helpers ----
  const selected = normalizeRecord(data[selectedKey]);
  const countdown = useCountdown(target);

  function setTask(idx, value) {
    updateSelected((rec) => {
      if (idx === "optional") rec.optional = value;
      else if (idx === "optionalText") rec.optionalText = value;
      else rec.fixed[idx] = value;
      return rec;
    });
  }

  function updateSelected(updater) {
    setData((prev) => {
      const next = { ...prev };
      const base = normalizeRecord(prev[selectedKey]);
      const updated = updater({ ...base });
      next[selectedKey] = updated;

      // lock for ~1.2s
      markDirty(selectedKey);
      clearDirtyLater(selectedKey, 1200);

      // save (no-op if read-only)
      saveEntry(selectedKey, updated);

      return next;
    });
  }

  function onClearDay(key) {
    setData((prev) => ({ ...prev, [key]: { fixed: [false, false, false], optional: false, optionalText: "" } }));
  }
  function onToggleGolden(key) {
    setData((prev) => {
      const cur = normalizeRecord(prev[key]);
      const allFixed = cur.fixed.every(Boolean);
      const willBeGolden = !(allFixed && cur.optional);
      return {
        ...prev,
        [key]: {
          fixed: [true, true, true],
          optional: willBeGolden ? true : false,
          optionalText: cur.optionalText || "",
        },
      };
    });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <Header
          target={target ? fmtDateKey(target) : ""}
          onChangeTarget={(val) => setTarget(val ? new Date(`${val}T00:00:00`) : null)}
        />

        {/* Countdown */}
        <section className="mt-6">
          {target ? (
            <CounterCards {...countdown} />
          ) : (
            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-neutral-300">
              Pick a target date to start the countdown.
            </div>
          )}
        </section>

        {/* Legend + Save status (fixed 182 days; dropdown removed) */}
        <section className="mt-8 flex flex-wrap items-center gap-3">
          <Legend />
          {/* <div className="text-xs text-neutral-400 ml-auto">
            {saveState === "readonly" && "Read-only: sign in as owner to save"}
            {saveState === "saving" && "Saving..."}
            {saveState === "saved" && "All changes saved"}
            {saveState === "error" && "Save failed — check console"}
          </div> */}
        </section>

        {/* Original vertical grid */}
        <section className="mt-4">
          <Grid
            dates={dates}
            data={data}
            todayKey={todayKey}
            onPickDay={setSelectedKey}
            computeDayState={computeDayState}
            shadeFromFraction={shadeFromFraction}
            showTip={showTip}
            hideTip={hideTip}
          />
        </section>

        {/* Editor */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <DayEditor
            selectedKey={selectedKey}
            record={selected}
            setTask={setTask}
            onClear={onClearDay}
            onToggleGolden={onToggleGolden}
            labels={TASK_LABELS}
          />
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
            <h2 className="text-lg font-medium">How brightness works</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-neutral-300 space-y-2">
              <li>Each day has 3 fixed tasks and 1 optional task (+ optional text).</li>
              <li>
                Brightness is based on <span className="font-semibold">3 slots</span>. Each fixed task fills 1 slot. If you miss a fixed task, the optional task can fill{" "}
                <span className="font-semibold">one</span> missing slot.
              </li>
              <li>
                Brightness = filled slots ÷ 3. The day turns <span className="text-yellow-400">golden</span> if you complete all 3 fixed tasks <em>and</em> the optional task.
              </li>
              <li>Click a square to edit that day. <span className="text-neutral-400">(Double-click to toggle golden quickly.)</span></li>
              <li>Data is saved centrally; public can view, only you can edit.</li>
            </ul>
          </div>
        </section>

        <footer className="mt-10 text-xs text-neutral-500">
          Built with React + Tailwind (public view; owner can edit).
        </footer>

        {/* One tooltip instance */}
        <Tooltip tip={tip} />
      </div>

      {/* Floating admin */}
      <AdminButton onOpen={() => setAdminOpen(true)} />
      <Modal open={adminOpen} onClose={() => setAdminOpen(false)}>
        <AuthBox ownerUuid={OWNER_UUID} />
      </Modal>
    </div>
  );
}

// ====== helpers ======
function normalizeRecord(rec) {
  if (!rec) return { fixed: [false, false, false], optional: false, optionalText: "" };
  return {
    fixed: Array.isArray(rec.fixed) ? rec.fixed.slice(0, 3).concat([false, false, false]).slice(0, 3) : [false, false, false],
    optional: !!rec.optional,
    optionalText: typeof rec.optionalText === "string" ? rec.optionalText : "",
  };
}

function renderTipContent(key, rec) {
  const d = parseDateKey(key);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const { fraction, isGolden, optionalSubbed } = computeDayState(rec);
  const pct = Math.round(fraction * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{weekday}</div>
          <div className="text-xs text-neutral-400">{dateStr}</div>
        </div>
        <span
          className={[
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
            isGolden
              ? "bg-yellow-400/20 text-yellow-300 border border-yellow-500/40"
              : "bg-emerald-400/10 text-emerald-300 border border-emerald-500/30",
          ].join(" ")}
        >
          {isGolden ? "Golden Day" : `${pct}%`}
        </span>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={["h-2 w-8 rounded-full", rec.fixed[i] ? "bg-emerald-400/80" : "bg-neutral-700"].join(" ")} />
        ))}
        <div
          className={[
            "h-2 w-8 rounded-full",
            rec.optional ? (optionalSubbed ? "bg-emerald-300/80" : "bg-emerald-400/60") : "bg-neutral-700",
          ].join(" ")}
          title={optionalSubbed ? "Counted as a substitute" : "Optional"}
        />
      </div>

      <div className="text-xs leading-5">
        {["Do LeetCode", "Work on projects", "Learn tech-related stuff"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={[
                "inline-block h-4 w-4 rounded-[4px] border",
                rec.fixed[i] ? "bg-emerald-500/80 border-emerald-400" : "bg-neutral-800 border-neutral-700",
              ].join(" ")}
            />
            <span className={rec.fixed[i] ? "text-neutral-100" : "text-neutral-400"}>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={[
              "inline-block h-4 w-4 rounded-[4px] border",
              rec.optional ? "bg-emerald-400/70 border-emerald-400" : "bg-neutral-800 border-neutral-700",
            ].join(" ")}
          />
          <span className={rec.optional ? "text-neutral-100" : "text-neutral-400"}>
            Optional {rec.optionalText ? <em className="text-neutral-300">— {rec.optionalText}</em> : null}
          </span>
        </div>
      </div>
    </div>
  );
}
