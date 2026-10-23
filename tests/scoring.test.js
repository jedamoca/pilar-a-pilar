import test from 'node:test';
import assert from 'node:assert/strict';
import { getScoreBand, isValidScore, getWeeklyPoints, getWeeklyMaxPoints, countCompletedActivities, getWeeklySummary } from '../js/scoring.js';

test('acepta únicamente puntuaciones enteras del 1 al 10', () => {
  for (let score = 1; score <= 10; score += 1) assert.equal(isValidScore(score), true);
  for (const score of [0, 11, -1, 1.5, '5', null]) assert.equal(isValidScore(score), false);
});

test('clasifica correctamente los límites de color', () => {
  assert.equal(getScoreBand(1).className, 'band-red');
  assert.equal(getScoreBand(3).className, 'band-red');
  assert.equal(getScoreBand(4).className, 'band-orange');
  assert.equal(getScoreBand(6).className, 'band-orange');
  assert.equal(getScoreBand(7).className, 'band-light-green');
  assert.equal(getScoreBand(8).className, 'band-light-green');
  assert.equal(getScoreBand(9).className, 'band-green');
  assert.equal(getScoreBand(10).className, 'band-green');
});

test('rechaza puntuaciones fuera de rango al pedir una categoría', () => {
  assert.throws(() => getScoreBand(0), RangeError);
  assert.throws(() => getScoreBand(11), RangeError);
});

test('calcula puntos según las actividades planificadas y completadas', () => {
  assert.equal(getWeeklyPoints(0, 1), 0);
  assert.equal(getWeeklyPoints(1, 1), 1);
  assert.equal(getWeeklyPoints(0, 2), 0);
  assert.equal(getWeeklyPoints(1, 2), 0);
  assert.equal(getWeeklyPoints(2, 2), 1);
  assert.equal(getWeeklyPoints(0, 3), 0);
  assert.equal(getWeeklyPoints(1, 3), 0);
  assert.equal(getWeeklyPoints(2, 3), 1);
  assert.equal(getWeeklyPoints(3, 3), 2);
  assert.equal(getWeeklyMaxPoints(0), 0);
  assert.equal(getWeeklyMaxPoints(1), 1);
  assert.equal(getWeeklyMaxPoints(2), 1);
  assert.equal(getWeeklyMaxPoints(3), 2);
  assert.throws(() => getWeeklyPoints(4, 3), RangeError);
  assert.throws(() => getWeeklyPoints(-1, 3), RangeError);
  assert.throws(() => getWeeklyPoints(2, 1), RangeError);
});

test('distingue un plan no configurado y adapta el máximo de puntos al plan', () => {
  assert.deepEqual(getWeeklySummary([]), { total: 0, completed: 0, points: null, maxPoints: 0 });
  const oneTask = [{ completed: true }];
  assert.deepEqual(getWeeklySummary(oneTask), { total: 1, completed: 1, points: 1, maxPoints: 1 });
  const twoTasks = [{ completed: true }, { completed: true }];
  assert.deepEqual(getWeeklySummary(twoTasks), { total: 2, completed: 2, points: 1, maxPoints: 1 });
  const threeTasks = [{ completed: true }, { completed: true }, { completed: false }];
  assert.deepEqual(getWeeklySummary(threeTasks), { total: 3, completed: 2, points: 1, maxPoints: 2 });
  assert.equal(countCompletedActivities([{ completed: true }, { completed: true }, { completed: false }]), 2);
});
