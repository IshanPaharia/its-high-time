import { useEffect, useMemo, useState } from "react";
import { parseDateKey, todayKey as tk } from "../utils/dates";

export function useStableToday() {
  const [todayKey, setTodayKey] = useState(tk());
  useEffect(() => {
    const id = setInterval(() => setTodayKey((p) => (p === tk() ? p : tk())), 60_000);
    return () => clearInterval(id);
  }, []);
  const endDate = useMemo(() => parseDateKey(todayKey), [todayKey]);
  return { todayKey, endDate };
}
