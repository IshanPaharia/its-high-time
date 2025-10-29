import { createPortal } from "react-dom";
export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative m-4 sm:m-0 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl w-[320px] sm:w-[360px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-neutral-200">Admin Panel</h3>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300">Close</button>
        </div>
        <div className="border-t border-neutral-800 my-3" />
        <div className="text-sm text-neutral-300 space-y-3">{children}</div>
      </div>
    </div>, document.body
  );
}
