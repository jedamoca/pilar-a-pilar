import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, createInitialState, loadState, saveState, clearState, validateState, StorageError } from '../js/storage.js';

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
}

test('crea y carga un estado inicial si no hay datos guardados', () => {
  const storage = fakeStorage();
  const state = loadState(storage);
  assert.equal(state.schemaVersion, 1);
  assert.deepEqual(state.evaluations, []);
  assert.deepEqual(state.plans, {});
  assert.equal(validateState(state), true);
});

test('guarda y recupera datos válidos', () => {
  const storage = fakeStorage();
  const state = createInitialState(new Date('2026-10-22T15:00:00.000Z'));
  saveState(state, storage, new Date('2026-10-23T15:00:00.000Z'));
  const reloaded = loadState(storage);
  assert.equal(reloaded.updatedAt, '2026-10-23T15:00:00.000Z');
  assert.equal(storage.getItem(STORAGE_KEY) !== null, true);
});

test('rechaza JSON dañado y estructuras incompatibles sin sobreescribirlas', () => {
  const broken = fakeStorage({ [STORAGE_KEY]: '{no-json' });
  assert.throws(() => loadState(broken), StorageError);
  assert.equal(broken.getItem(STORAGE_KEY), '{no-json');
  const unsupported = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 88 }) });
  assert.throws(() => loadState(unsupported), StorageError);
});

test('no guarda un estado que incumple el límite de actividades', () => {
  const storage = fakeStorage();
  const state = createInitialState();
  state.plans['2026-10-19'] = {
    weekStart: '2026-10-19',
    pillars: { health: { activities: [1, 2, 3, 4].map((n) => ({ id: `id-${n}`, text: `Actividad ${n}`, estimatedMinutes: 10, completed: false, completedAt: null })) } }
  };
  assert.equal(validateState(state), false);
  assert.throws(() => saveState(state, storage), StorageError);
});

test('borra la clave de almacenamiento de forma explícita', () => {
  const storage = fakeStorage({ [STORAGE_KEY]: '{}' });
  clearState(storage);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});


test('rechaza semanas que no empiezan en lunes y fechas de evaluación inválidas', () => {
  const state = createInitialState();
  state.plans['2026-10-20'] = { weekStart: '2026-10-20', pillars: {} };
  assert.equal(validateState(state), false);

  const stateWithBadEvaluation = createInitialState();
  stateWithBadEvaluation.evaluations.push({ id: 'bad-date', date: '2026-02-30', type: 'baseline', scores: Object.fromEntries(['finances', 'health', 'personal-growth', 'relationships', 'career', 'leisure', 'spirituality'].map((id) => [id, 5])) });
  assert.equal(validateState(stateWithBadEvaluation), false);
});


test('permite guardar actividades sin tiempo estimado y sigue validando los tiempos informados', () => {
  const state = createInitialState();
  state.plans['2026-10-19'] = {
    weekStart: '2026-10-19',
    pillars: { health: { activities: [
      { id: 'no-time', text: 'Caminar', estimatedMinutes: null, completed: false, completedAt: null },
      { id: 'with-time', text: 'Leer', estimatedMinutes: 30, completed: true, completedAt: '2026-10-20T12:00:00.000Z' }
    ] } }
  };
  assert.equal(validateState(state), true);
  state.plans['2026-10-19'].pillars.health.activities[0].estimatedMinutes = 0;
  assert.equal(validateState(state), false);
});
