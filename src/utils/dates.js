export const fmtDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const parseDateKey = (k) => new Date(`${k}T00:00:00`);
export const todayKey = () => fmtDateKey(new Date());

export function generateDateRange(start, end) {
  const out = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function startOfWeek(d, weekStartsOn = 0) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() - weekStartsOn + 7) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

export function generateWeeks(endDate, weeks = 26, weekStartsOn = 0) {
  // Align end to the END of its week so the last column contains the current week
  const endWeekStart = startOfWeek(endDate, weekStartsOn);
  const endOfCurrentWeek = new Date(endWeekStart);
  endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 6);

  const cols = [];
  let colEnd = endOfCurrentWeek;

  for (let i = 0; i < weeks; i++) {
    const col = [];
    for (let r = 0; r < 7; r++) {
      const d = new Date(colEnd);
      d.setDate(d.getDate() - (6 - r)); // top→bottom = Sun→Sat
      col.push(d);
    }
    cols.unshift(col); // oldest → newest left→right
    colEnd = new Date(colEnd);
    colEnd.setDate(colEnd.getDate() - 7);
  }
  return cols;
}

export function monthLabelForColumn(column) {
  const firstOfMonth = column.find((d) => d.getDate() === 1);
  return firstOfMonth
    ? firstOfMonth.toLocaleString(undefined, { month: "short" })
    : "";
}
