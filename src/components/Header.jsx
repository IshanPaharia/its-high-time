export default function Header({ target, onChangeTarget }) {
    return (
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Personal Progress Tracker</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Dark-themed, day-wise grid with a countdown. Optional task can substitute for a missed fixed task.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-300">Target date</label>
          <input
            type="date"
            value={target}
            onChange={(e) => onChangeTarget(e.target.value)}
            className="bg-neutral-900 text-neutral-100 rounded-lg px-3 py-2 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </header>
    );
  }
  