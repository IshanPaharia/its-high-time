export default function Legend() {
    const box = "inline-block h-4 w-4 rounded-sm";
    return (
      <div className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
        <span className={`${box} bg-neutral-700`} />
        <span>none</span>
        <span className={box} style={{ background: "hsl(142 70% 16%)" }} />
        <span>low</span>
        <span className={box} style={{ background: "hsl(142 70% 40%)" }} />
        <span>medium</span>
        <span className={box} style={{ background: "hsl(142 70% 55%)" }} />
        <span>high</span>
        <span className={`${box} border border-yellow-300 bg-yellow-400`} />
        <span>golden</span>
      </div>
    );
  }
  