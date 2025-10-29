export default function DayEditor({ selectedKey, record, setTask, onClear, onToggleGolden, labels }) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Edit day</h2>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700" onClick={() => onClear(selectedKey)}>
              Clear
            </button>
            <button className="text-xs px-2 py-1 rounded-md bg-yellow-500 text-black hover:bg-yellow-400" onClick={() => onToggleGolden(selectedKey)}>
              Toggle Golden
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-400 mt-1">{selectedKey}</p>
  
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <label key={i} className="flex items-center gap-3">
              <input type="checkbox" checked={record.fixed[i]} onChange={(e) => setTask(i, e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              <span className="text-sm">{labels[i]}</span>
            </label>
          ))}
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={record.optional} onChange={(e) => setTask("optional", e.target.checked)} className="h-4 w-4 accent-emerald-500" />
            <span className="text-sm">Optional task</span>
          </div>
          <input
            type="text"
            value={record.optionalText}
            onChange={(e) => setTask("optionalText", e.target.value)}
            placeholder="What was your optional task?"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    );
  }
  