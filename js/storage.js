import { PILLARS } from './pillars.js';
import { isValidScore } from './scoring.js';
import { parseDateKey, getWeekKey } from './dates.js';

export const STORAGE_KEY = 'mi-equilibrio:data:v1';
export const SCHEMA_VERSION = 1;

export class StorageError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = 'StorageError';
  }
}

export function createInitialState(now = new Date()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    evaluations: [],
    plans: {}
  };
}

export function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  if (state.schemaVersion !== SCHEMA_VERSION) return false;
  if (!Array.isArray(state.evaluations) || !state.plans || typeof state.plans !== 'object' || Array.isArray(state.plans)) return false;
  if (typeof state.createdAt !== 'string' || typeof state.updatedAt !== 'string') return false;

  const validPillarIds = new Set(PILLARS.map((pillar) => pillar.id));
  for (const evaluation of state.evaluations) {
    if (!evaluation || typeof evaluation.id !== 'string' || evaluation.id.length === 0 || typeof evaluation.date !== 'string') return false;
    try { parseDateKey(evaluation.date); } catch { return false; }
    if (!['baseline', 'manual'].includes(evaluation.type)) return false;
    if (!evaluation.scores || typeof evaluation.scores !== 'object') return false;
    for (const pillar of PILLARS) {
      if (!isValidScore(evaluation.scores[pillar.id])) return false;
    }
  }

  for (const [weekKey, plan] of Object.entries(state.plans)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey) || !plan || plan.weekStart !== weekKey) return false;
    try { if (getWeekKey(parseDateKey(weekKey)) !== weekKey) return false; } catch { return false; }
    if (!plan.pillars || typeof plan.pillars !== 'object') return false;
    for (const [pillarId, pillarPlan] of Object.entries(plan.pillars)) {
      if (!validPillarIds.has(pillarId) || !pillarPlan || !Array.isArray(pillarPlan.activities)) return false;
      if (pillarPlan.activities.length > 3) return false;
      const ids = new Set();
      for (const activity of pillarPlan.activities) {
        if (!activity || typeof activity.id !== 'string' || ids.has(activity.id)) return false;
        ids.add(activity.id);
        if (typeof activity.text !== 'string' || activity.text.trim().length < 1 || activity.text.length > 180) return false;
        if (activity.estimatedMinutes !== null && (!Number.isInteger(activity.estimatedMinutes) || activity.estimatedMinutes < 1 || activity.estimatedMinutes > 10080)) return false;
        if (typeof activity.completed !== 'boolean') return false;
        if (activity.completedAt !== null && typeof activity.completedAt !== 'string') return false;
      }
    }
  }
  return true;
}

export function loadState(storage = getLocalStorage()) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch (error) {
    throw new StorageError('No se pudo leer el almacenamiento local del navegador.', error);
  }
  if (raw === null) return createInitialState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new StorageError('Los datos guardados no se pueden leer porque el contenido está dañado.', error);
  }
  if (!validateState(parsed)) {
    throw new StorageError('Los datos guardados no tienen un formato compatible con esta versión de la aplicación.');
  }
  return parsed;
}

export function saveState(state, storage = getLocalStorage(), now = new Date()) {
  if (!validateState(state)) {
    throw new StorageError('Se evitó guardar información que no cumple con las reglas de la aplicación.');
  }
  const payload = { ...state, updatedAt: now.toISOString() };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    throw new StorageError('No se pudieron guardar los cambios. Comprueba el espacio disponible y los permisos de almacenamiento del navegador.', error);
  }
  return payload;
}

export function clearState(storage = getLocalStorage()) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw new StorageError('No se pudieron borrar los datos de la aplicación del navegador.', error);
  }
}

export function getRawState(storage = getLocalStorage()) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch (error) {
    throw new StorageError('No se pudieron consultar los datos locales.', error);
  }
}

function getLocalStorage() {
  try {
    if (!globalThis.localStorage) throw new Error('localStorage no disponible');
    return globalThis.localStorage;
  } catch (error) {
    throw new StorageError('El navegador no permite acceder al almacenamiento local.', error);
  }
}
