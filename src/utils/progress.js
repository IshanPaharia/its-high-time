export function computeDayState({ fixed=[false,false,false], optional=false }) {
    const done = fixed.filter(Boolean).length;
    const substituted = optional && done < 3 ? 1 : 0;
    const slots = Math.min(3, done + substituted);
    return { fraction: slots / 3, isGolden: done === 3 && optional, optionalSubbed: substituted === 1 };
  }
  export function shadeFromFraction(f) {
    const light = Math.round(10 + f * 45);
    return `hsl(142 70% ${light}%)`;
  }
  