export const toLocalISODate = (d = new Date()) => {
  // Build YYYY-MM-DD using local time (no TZ drift)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSameLocalDayISO = (iso?: string, ref = new Date()) => {
  if (!iso) return false;
  return iso.slice(0, 10) === toLocalISODate(ref);
};