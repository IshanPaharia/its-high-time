import { createPortal } from "react-dom";
export default function Tooltip({ tip }) {
  if (!tip) return null;
  const { x, y, content } = tip;
  return createPortal(
    <div className="fixed z-50 pointer-events-none" style={{ left:x, top:y }}>
      <div className="rounded-xl bg-neutral-900/95 backdrop-blur border border-neutral-800 shadow-2xl p-3 max-w-xs">{content}</div>
      <div className="mx-auto -mt-1 h-3 w-3 rotate-45 bg-neutral-900/95 border-b border-r border-neutral-800" />
    </div>, document.body
  );
}
