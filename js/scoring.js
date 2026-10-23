/** Reglas de evaluación y cumplimiento, independientes del renderizado. */
export const SCORE_BANDS = [
  { min: 1, max: 3, label: 'Insatisfacción importante', color: '#dc2626', className: 'band-red' },
  { min: 4, max: 6, label: 'Necesita atención', color: '#ea580c', className: 'band-orange' },
  { min: 7, max: 8, label: 'Relativamente satisfactorio', color: '#86efac', className: 'band-light-green' },
  { min: 9, max: 10, label: 'Alta satisfacción', color: '#16a34a', className: 'band-green' }
];

export function isValidScore(value) {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

export function getScoreBand(score) {
  if (!isValidScore(score)) throw new RangeError('La puntuación debe ser un número entero entre 1 y 10.');
  return SCORE_BANDS.find((band) => score >= band.min && score <= band.max);
}

export function countCompletedActivities(activities = []) {
  return activities.reduce((total, activity) => total + (activity.completed === true ? 1 : 0), 0);
}

export function getWeeklyPoints(completedCount, plannedCount = 3) {
  if (!Number.isInteger(plannedCount) || plannedCount < 0 || plannedCount > 3) {
    throw new RangeError('La cantidad de actividades planificadas debe ser un entero entre 0 y 3.');
  }
  if (!Number.isInteger(completedCount) || completedCount < 0 || completedCount > plannedCount) {
    throw new RangeError('La cantidad de actividades completadas debe estar entre 0 y las actividades planificadas.');
  }
  if (plannedCount === 0 || completedCount === 0) return 0;
  if (plannedCount === 1) return completedCount === 1 ? 1 : 0;
  if (plannedCount === 2) return completedCount === 2 ? 1 : 0;
  if (completedCount === 2) return 1;
  return completedCount === 3 ? 2 : 0;
}

export function getWeeklyMaxPoints(plannedCount) {
  if (!Number.isInteger(plannedCount) || plannedCount < 0 || plannedCount > 3) {
    throw new RangeError('La cantidad de actividades planificadas debe ser un entero entre 0 y 3.');
  }
  if (plannedCount === 0) return 0;
  return plannedCount < 3 ? 1 : 2;
}

export function getWeeklySummary(activities = []) {
  const total = activities.length;
  const completed = countCompletedActivities(activities);
  return {
    total,
    completed,
    points: total === 0 ? null : getWeeklyPoints(completed, total),
    maxPoints: getWeeklyMaxPoints(total)
  };
}
