import test from 'node:test';
import assert from 'node:assert/strict';
import { PILLARS } from '../js/pillars.js';
import { createInitialState } from '../js/storage.js';
import { renderWelcome, renderDashboard, renderAssessment, renderGoals, renderGuide, renderHistory, renderSettings, escapeHTML } from '../js/views.js';

const scores = Object.fromEntries(PILLARS.map((pillar, index) => [pillar.id, index + 1]));
const sampleState = createInitialState(new Date('2026-10-22T12:00:00.000Z'));
sampleState.evaluations.push({ id: 'evaluation-1', date: '2026-10-22', type: 'baseline', scores });

 test('escapa texto que podría interpretarse como HTML', () => {
  assert.equal(escapeHTML('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
});

test('renderiza bienvenida y los siete pilares configurados', () => {
  const html = renderWelcome(false);
  assert.match(html, /Construye una vida más/);
  for (const pillar of PILLARS) assert.ok(html.includes(pillar.name));
});

test('renderiza panel con puntuación, colores y acciones de metas', () => {
  const html = renderDashboard(sampleState, new Date(2026, 9, 22));
  assert.match(html, /Tus siete pilares/);
  assert.match(html, /Establecer metas/);
  assert.match(html, /Ver metas/);
  assert.match(html, /aria-valuenow="1"/);
});

test('renderiza cuestionario, objetivos, guía, historial y ajustes', () => {
  const draft = { type: 'baseline', index: 0, scores: { finances: 4 } };
  assert.match(renderAssessment(draft), /Selecciona una puntuación/);
  const goalsHtml = renderGoals(sampleState, 'health', new Date(2026, 9, 22));
  assert.match(goalsHtml, /Guardar plan semanal/);
  assert.match(goalsHtml, /Tiempo estimado para toda la semana \(opcional\)/);
  assert.match(goalsHtml, /Plan de 1 actividad/);
  assert.match(renderGuide(), /Ejemplos de actividades/i);
  assert.match(renderGuide(), /Guía rápida de puntos semanales/);
  assert.match(renderHistory(sampleState), /Evaluaciones de satisfacción/);
  assert.match(renderSettings(sampleState), /Borrar todos mis datos/);
});
