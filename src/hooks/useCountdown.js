import { useEffect, useState } from "react";
export function useCountdown(target) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
  if (!target) return { days:0, hours:0, mins:0, secs:0 };
  const diff = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(diff/1000);
  return { days: Math.floor(s/86400), hours: Math.floor((s%86400)/3600), mins: Math.floor((s%3600)/60), secs: s%60 };
}
