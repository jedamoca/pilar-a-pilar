/** Funciones de fechas locales; la semana empieza el lunes. */
export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    throw new TypeError('La fecha debe tener el formato AAAA-MM-DD.');
  }
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new RangeError('La fecha indicada no existe.');
  }
  return date;
}

export function getWeekStart(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = monday.getDay();
  monday.setDate(monday.getDate() - ((day + 6) % 7));
  return monday;
}

export function getWeekEnd(date = new Date()) {
  const sunday = getWeekStart(date);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

export function getWeekKey(date = new Date()) {
  return toDateKey(getWeekStart(date));
}

export function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(dateOrKey, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const date = typeof dateOrKey === 'string' ? parseDateKey(dateOrKey) : dateOrKey;
  return new Intl.DateTimeFormat('es-CO', options).format(date);
}

export function formatWeekRange(weekKey) {
  const start = parseDateKey(weekKey);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const month = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(start);
    return `${start.getDate()}–${end.getDate()} ${month} ${start.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function isCurrentWeek(weekKey, referenceDate = new Date()) {
  return weekKey === getWeekKey(referenceDate);
}
