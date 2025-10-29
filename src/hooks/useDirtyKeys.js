import { useState } from "react";
export function useDirtyKeys() {
  const [dirtyKeys, setDirtyKeys] = useState(new Set());
  const markDirty = (k) => setDirtyKeys(s => new Set(s).add(k));
  const clearDirtyLater = (k, ms=1200) => setTimeout(() => {
    setDirtyKeys(s => { const t = new Set(s); t.delete(k); return t; });
  }, ms);
  return { dirtyKeys, markDirty, clearDirtyLater };
}
