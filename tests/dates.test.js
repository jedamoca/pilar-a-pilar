import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeekKey, getWeekEnd, getWeekStart, toDateKey, parseDateKey, addDays, formatWeekRange } from '../js/dates.js';

test('calcula el lunes como inicio de semana', () => {
  assert.equal(getWeekKey(new Date(2026, 9, 19, 12)), '2026-10-19'); // lunes
  assert.equal(getWeekKey(new Date(2026, 9, 22, 12)), '2026-10-19'); // jueves
  assert.equal(getWeekKey(new Date(2026, 9, 25, 12)), '2026-10-19'); // domingo
});

test('calculates a week boundary across a month change', () => {
  assert.equal(toDateKey(getWeekStart(new Date(2026, 10, 1))), '2026-10-26');
  assert.equal(toDateKey(getWeekEnd(new Date(2026, 9, 26))), '2026-11-01');
});

test('parses date keys and adds days without relying on UTC', () => {
  assert.equal(toDateKey(parseDateKey('2026-10-22')), '2026-10-22');
  assert.equal(toDateKey(addDays(parseDateKey('2026-10-31'), 1)), '2026-11-01');
  assert.throws(() => parseDateKey('2026-02-30'), RangeError);
  assert.throws(() => parseDateKey('22-10-2026'), TypeError);
});

test('formats a human-readable week range', () => {
  assert.match(formatWeekRange('2026-10-19'), /19.*25/);
});
