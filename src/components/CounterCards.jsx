export default function CounterCards({ days, hours, mins, secs }) {
    const items = [
      { label: "Days", value: days },
      { label: "Hours", value: hours },
      { label: "Minutes", value: mins },
      { label: "Seconds", value: secs },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((b) => (
          <div key={b.label} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-center">
            <div className="text-3xl font-bold tabular-nums">{b.value}</div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">{b.label}</div>
          </div>
        ))}
      </div>
    );
  }
  