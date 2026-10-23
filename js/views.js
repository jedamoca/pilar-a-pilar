import { PILLARS, PILLAR_BY_ID } from './pillars.js';
import { getScoreBand, getWeeklySummary } from './scoring.js';
import { formatDate, formatWeekRange, getWeekKey } from './dates.js';

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function renderWelcome(hasEvaluation = false) {
  const actionLabel = hasEvaluation ? 'Volver a mi panel' : 'Evaluar mis pilares';
  const action = hasEvaluation ? 'dashboard' : 'start-baseline';
  return `
    <section class="welcome-page page-enter">
      <div class="welcome-copy">
        <span class="eyebrow"><span class="eyebrow-dot"></span> UN ESPACIO PARA TI</span>
        <h1>Construye una vida más <span class="text-accent">equilibrada.</span></h1>
        <p class="welcome-lead">Conoce dónde estás hoy, elige tus prioridades y avanza poco a poco. No necesitas tener todo resuelto para empezar.</p>
        <div class="reassurance-card">
          <span class="reassurance-icon" aria-hidden="true">♡</span>
          <p><strong>No es un examen ni una competencia.</strong> Tus respuestas no te hacen una persona buena o mala. Son una fotografía de cómo percibes tu vida en este momento.</p>
        </div>
        <button class="button button-primary button-large" type="button" data-action="${action}">${actionLabel}<span aria-hidden="true">→</span></button>
        <p class="subtle-note">Tu información se guarda en este navegador. No necesitas crear una cuenta.</p>
      </div>
      <div class="welcome-visual" aria-label="Resumen ilustrativo de los siete pilares de la vida">
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <div class="visual-center"><img class="visual-brand-mark" src="./favicon.svg" alt="" aria-hidden="true"><strong>Pilar<br>a Pilar</strong><small>paso a paso</small></div>
        <span class="orbit-label orbit-finance"><span class="mini-symbol" style="--tile:#dbeafe;--ink:#1d4ed8">$</span> Finanzas</span>
        <span class="orbit-label orbit-health"><span class="mini-symbol" style="--tile:#ffedd5;--ink:#c2410c">♡</span> Salud</span>
        <span class="orbit-label orbit-growth"><span class="mini-symbol" style="--tile:#ede9fe;--ink:#7c3aed">✦</span> Crecimiento</span>
        <span class="orbit-label orbit-people"><span class="mini-symbol" style="--tile:#fce7f3;--ink:#be185d">◎</span> Relaciones</span>
        <span class="orbit-label orbit-career"><span class="mini-symbol" style="--tile:#d1fae5;--ink:#047857">▣</span> Carrera</span>
        <span class="orbit-label orbit-leisure"><span class="mini-symbol" style="--tile:#fef3c7;--ink:#a16207">☼</span> Ocio</span>
        <span class="orbit-label orbit-spirit"><span class="mini-symbol" style="--tile:#e0f2fe;--ink:#0369a1">✧</span> Espiritualidad</span>
      </div>
      <section class="welcome-pillars-strip" aria-labelledby="welcome-pillars-title">
        <div class="welcome-pillars-heading"><span class="eyebrow">TUS SIETE PILARES</span><h2 id="welcome-pillars-title">Una mirada a las áreas importantes de tu vida</h2></div>
        <div class="welcome-pillar-tags">
          ${PILLARS.map((pillar) => `<span class="welcome-pillar-tag"><span class="mini-symbol" style="--tile:${pillar.softColor};--ink:${pillar.color}" aria-hidden="true">${pillar.icon}</span>${escapeHTML(pillar.name)}</span>`).join('')}
        </div>
      </section>
      <div class="welcome-bottom">
        <div class="welcome-bottom-item"><span>01</span><div><strong>Evalúa</strong><p>Responde con honestidad y sin juzgarte.</p></div></div>
        <div class="welcome-bottom-item"><span>02</span><div><strong>Prioriza</strong><p>Identifica dónde quieres poner atención.</p></div></div>
        <div class="welcome-bottom-item"><span>03</span><div><strong>Avanza</strong><p>Convierte tus intenciones en acciones semanales.</p></div></div>
      </div>
    </section>`;
}

export function renderAssessment(draft) {
  const pillar = PILLARS[draft.index];
  const chosen = draft.scores[pillar.id];
  const step = draft.index + 1;
  const progress = Math.round((step / PILLARS.length) * 100);
  const title = draft.type === 'baseline' ? 'Tu primera evaluación' : 'Revisa cómo te sientes hoy';
  return `
    <section class="narrow-page page-enter">
      <div class="page-topline"><button type="button" class="text-button" data-action="cancel-assessment">← Volver</button><span class="eyebrow">AUTOEVALUACIÓN</span></div>
      <div class="assessment-heading"><span class="eyebrow">${escapeHTML(title)}</span><h1>¿Cómo te sientes con este pilar?</h1><p>Responde pensando en tu situación actual. No existe una respuesta perfecta.</p></div>
      <div class="step-meta"><span>Pilar ${step} de ${PILLARS.length}</span><span>${progress}%</span></div>
      <div class="progress-track" aria-label="Progreso del cuestionario"><span style="width:${progress}%"></span></div>
      <article class="assessment-card">
        <div class="pillar-symbol large-symbol" style="--pillar-color:${pillar.color};--pillar-soft:${pillar.softColor}" aria-hidden="true">${pillar.icon}</div>
        <h2>${escapeHTML(pillar.name)}</h2>
        <p class="question-text">${escapeHTML(pillar.question)}</p>
        <fieldset class="score-fieldset">
          <legend>Selecciona una puntuación del 1 al 10</legend>
          <div class="score-picker" role="group" aria-label="Puntuación para ${escapeHTML(pillar.name)}">
            ${Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
              const band = getScoreBand(score);
              return `<button class="score-choice ${band.className} ${chosen === score ? 'is-selected' : ''}" type="button" data-action="choose-score" data-score="${score}" aria-pressed="${chosen === score}" style="--score-color:${band.color}" aria-label="${score} de 10">${score}</button>`;
            }).join('')}
          </div>
          <div class="scale-labels"><span>1 · Muy insatisfecho</span><span>10 · Muy satisfecho</span></div>
        </fieldset>
        <div class="score-explanation" aria-live="polite">
          ${chosen ? `<span class="score-dot" style="background:${getScoreBand(chosen).color}"></span><span><strong>${chosen}/10 · ${escapeHTML(getScoreBand(chosen).label)}</strong><small>Esta puntuación describe tu percepción actual, no tu valor como persona.</small></span>` : '<span class="score-dot score-dot-muted"></span><span><strong>Elige la puntuación que mejor te represente</strong><small>Intenta responder con honestidad y amabilidad contigo.</small></span>'}
        </div>
        <div class="form-actions">
          <button class="button button-secondary" type="button" data-action="previous-question" ${draft.index === 0 ? 'disabled' : ''}>Anterior</button>
          ${draft.index < PILLARS.length - 1
            ? '<button class="button button-primary" type="button" data-action="next-question">Siguiente <span aria-hidden="true">→</span></button>'
            : '<button class="button button-primary" type="button" data-action="finish-assessment">Guardar evaluación <span aria-hidden="true">✓</span></button>'}
        </div>
      </article>
      <p class="privacy-note centered-note">Tus respuestas se guardan localmente en este navegador.</p>
    </section>`;
}

export function renderDashboard(state, now = new Date()) {
  const latest = state.evaluations.at(-1);
  if (!latest) return renderWelcome(false);
  const weekKey = getWeekKey(now);
  const weekPlan = state.plans[weekKey];
  const lowest = PILLARS.reduce((best, pillar) => latest.scores[pillar.id] < latest.scores[best.id] ? pillar : best, PILLARS[0]);
  const highest = PILLARS.reduce((best, pillar) => latest.scores[pillar.id] > latest.scores[best.id] ? pillar : best, PILLARS[0]);
  const plannedCount = PILLARS.filter((pillar) => weekPlan?.pillars?.[pillar.id]?.activities?.length).length;
  const cards = PILLARS.map((pillar) => {
    const score = latest.scores[pillar.id];
    const band = getScoreBand(score);
    const activities = weekPlan?.pillars?.[pillar.id]?.activities ?? [];
    const summary = getWeeklySummary(activities);
    const progressText = summary.total === 0 ? 'Sin plan esta semana' : `${summary.completed} de ${summary.total} actividades completadas`;
    const pointsText = summary.points === null ? '—' : `${summary.points}/${summary.maxPoints} ${summary.maxPoints === 1 ? 'punto' : 'puntos'}`;
    return `
      <article class="pillar-card" style="--pillar-color:${pillar.color};--pillar-soft:${pillar.softColor};--score-color:${band.color}">
        <div class="pillar-card-top"><span class="pillar-symbol" aria-hidden="true">${pillar.icon}</span><span class="score-badge ${band.className}">${score}/10</span></div>
        <h3>${escapeHTML(pillar.name)}</h3>
        <p class="pillar-status">${escapeHTML(band.label)}</p>
        <div class="pillar-progress-track" role="progressbar" aria-label="Satisfacción en ${escapeHTML(pillar.name)}" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${score}"><span style="width:${score * 10}%;background:${band.color}"></span></div>
        <div class="weekly-mini-summary"><span>${escapeHTML(progressText)}</span><strong>${pointsText}</strong></div>
        <div class="card-actions"><button class="button button-primary button-small" type="button" data-action="open-goals" data-pillar-id="${pillar.id}">${activities.length ? 'Editar metas' : 'Establecer metas'}</button><button class="button button-quiet button-small" type="button" data-action="view-goals" data-pillar-id="${pillar.id}">Ver metas</button></div>
      </article>`;
  }).join('');
  return `
    <section class="page page-enter">
      <div class="dashboard-heading"><div><span class="eyebrow">TU ESPACIO PERSONAL</span><h1>Tu vida, <span class="text-accent">a tu ritmo.</span></h1><p>Esta evaluación refleja cómo te sientes hoy. Puedes avanzar poco a poco, sin exigirte perfección.</p></div><button class="button button-secondary" type="button" data-action="start-reevaluation">↻ Reevaluar pilares</button></div>
      <div class="insight-grid">
        <article class="insight-card insight-priority"><div class="insight-icon" aria-hidden="true">◎</div><div><span class="insight-label">Pilar para atender</span><strong>${escapeHTML(lowest.name)}</strong><small>${latest.scores[lowest.id]}/10 · Puedes empezar con una acción pequeña.</small></div></article>
        <article class="insight-card insight-strength"><div class="insight-icon" aria-hidden="true">✦</div><div><span class="insight-label">Pilar más satisfactorio</span><strong>${escapeHTML(highest.name)}</strong><small>${latest.scores[highest.id]}/10 · Reconoce lo que ya estás cuidando.</small></div></article>
        <article class="insight-card insight-week"><div class="insight-icon" aria-hidden="true">✓</div><div><span class="insight-label">Plan de esta semana</span><strong>${plannedCount} de ${PILLARS.length} pilares con metas</strong><small>${escapeHTML(formatWeekRange(weekKey))}</small></div></article>
      </div>
      <div class="section-heading"><div><h2>Tus siete pilares</h2><p>Elige un pilar para definir o revisar tus acciones semanales.</p></div><button class="text-button" type="button" data-nav="guide">Ver guía de uso →</button></div>
      <div class="pillar-grid">${cards}</div>
      <div class="score-legend"><div><strong>¿Cómo leer los colores?</strong><span>Son orientativos, no una calificación de ti como persona.</span></div><div class="legend-items"><span><i class="legend-dot" style="background:#dc2626"></i>1–3</span><span><i class="legend-dot" style="background:#ea580c"></i>4–6</span><span><i class="legend-dot" style="background:#86efac"></i>7–8</span><span><i class="legend-dot" style="background:#16a34a"></i>9–10</span></div></div>
      <p class="last-evaluation-note">Última evaluación: ${escapeHTML(formatDate(latest.date))}. <button class="text-button" type="button" data-nav="history">Ver historial</button></p>
    </section>`;
}

export function renderActivityRow(activity = null, index = 0) {
  const id = activity?.id ?? '';
  const text = activity?.text ?? '';
  const minutes = activity?.estimatedMinutes ?? '';
  const completed = activity?.completed === true;
  return `
    <div class="activity-editor" data-activity-row data-id="${escapeHTML(id)}">
      <div class="activity-row-heading"><span class="activity-number">Actividad ${index + 1}</span><button class="icon-button danger-icon" type="button" data-action="remove-activity" aria-label="Eliminar actividad ${index + 1}" title="Eliminar actividad">×</button></div>
      <label class="field-label">¿Qué vas a hacer?<input class="text-input" type="text" data-field="activity-text" maxlength="180" value="${escapeHTML(text)}" placeholder="Ej. Practicar inglés 3 veces" autocomplete="off"></label>
      <div class="activity-row-bottom"><label class="field-label duration-field">Tiempo estimado para toda la semana (opcional)<input class="text-input" type="number" data-field="activity-minutes" min="1" max="10080" step="1" inputmode="numeric" value="${escapeHTML(minutes)}" placeholder="Ej. 120"><small class="field-note">Minutos totales previstos para completar esta actividad durante la semana.</small></label><label class="completion-check"><input type="checkbox" data-field="completed" ${completed ? 'checked' : ''}><span>Completada</span></label></div>
    </div>`;
}

export function renderGoals(state, pillarId, now = new Date()) {
  const pillar = PILLAR_BY_ID[pillarId];
  if (!pillar) return '<section class="page"><h1>Pilar no encontrado</h1><button class="button button-primary" data-nav="dashboard">Volver al panel</button></section>';
  const weekKey = getWeekKey(now);
  const plan = state.plans[weekKey];
  const activities = plan?.pillars?.[pillarId]?.activities ?? [];
  const summary = getWeeklySummary(activities);
  const rows = activities.length ? activities.map(renderActivityRow).join('') : renderActivityRow(null, 0);
  const estimatedActivities = activities.filter((activity) => Number.isInteger(activity.estimatedMinutes));
  const totalEstimatedMinutes = estimatedActivities.reduce((total, activity) => total + activity.estimatedMinutes, 0);
  const durationSummary = estimatedActivities.length === 0
    ? 'El tiempo es opcional; puedes dejarlo vacío si no te resulta útil.'
    : `${totalEstimatedMinutes} minutos estimados en total · ${estimatedActivities.length} de ${activities.length} actividades con duración registrada.`;
  const previousPlan = Object.keys(state.plans).filter((key) => key < weekKey && state.plans[key]?.pillars?.[pillarId]?.activities?.length).sort().at(-1);
  const canCopy = Boolean(previousPlan) && activities.length === 0;
  return `
    <section class="narrow-page page-enter">
      <div class="page-topline"><button class="text-button" type="button" data-nav="dashboard">← Volver a mis pilares</button><span class="eyebrow">PLAN SEMANAL</span></div>
      <div class="goal-heading"><span class="pillar-symbol large-symbol" style="--pillar-color:${pillar.color};--pillar-soft:${pillar.softColor}" aria-hidden="true">${pillar.icon}</span><div><h1>${escapeHTML(pillar.name)}</h1><p>${escapeHTML(pillar.description)}</p></div></div>
      <div class="week-banner"><span class="week-banner-icon" aria-hidden="true">▦</span><div><strong>Semana del ${escapeHTML(formatWeekRange(weekKey))}</strong><small>Define hasta tres actividades realistas para este pilar. Cada tiempo es el total estimado para completar esa actividad durante la semana.</small></div></div>
      <div class="weekly-score-card"><div><span class="eyebrow">CUMPLIMIENTO DE ESTA SEMANA</span><strong>${summary.points === null ? 'Sin plan' : `${summary.points} de ${summary.maxPoints} ${summary.maxPoints === 1 ? 'punto posible' : 'puntos posibles'}`}</strong><small>${summary.total === 0 ? 'Agrega al menos una actividad para crear tu plan.' : `${summary.completed} de ${summary.total} actividades completadas.`}</small></div><div class="weekly-score-mark" aria-hidden="true">${summary.points === null ? '—' : summary.points}</div></div>
      <div class="duration-summary"><span aria-hidden="true">◷</span><div><strong>Tiempo estimado del plan</strong><small>${escapeHTML(durationSummary)}</small></div></div>
      ${canCopy ? `<div class="copy-plan-row"><span>¿Quieres retomar tus actividades anteriores?</span><button type="button" class="text-button" data-action="copy-previous-plan" data-pillar-id="${pillarId}">Copiar plan anterior</button></div>` : ''}
      <form id="goals-form" class="goal-form" novalidate data-pillar-id="${pillarId}" data-week-key="${weekKey}">
        <div class="form-heading"><div><h2>Tus actividades</h2><p>Escribe acciones concretas y marca las que completes.</p></div><span class="activity-counter" id="activity-counter">${activities.length || 0}/3</span></div>
        <div id="activity-list" class="activity-list">${rows}</div>
        <button class="button button-secondary add-activity-button" type="button" data-action="add-activity" ${activities.length >= 3 ? 'disabled' : ''}>＋ Agregar actividad</button>
        <section class="points-guide" aria-labelledby="points-guide-title"><h3 id="points-guide-title">¿Cómo ganas puntos esta semana?</h3><p>El resultado depende de cuántas actividades decidiste incluir en tu plan y cuántas completas.</p><ul><li><strong>Plan de 1 actividad:</strong> si la completas, ganas <b>1 punto</b>.</li><li><strong>Plan de 2 actividades:</strong> si completas las dos, ganas <b>1 punto</b>.</li><li><strong>Plan de 3 actividades:</strong> si completas 2, ganas <b>1 punto</b>; si completas las 3, ganas <b>2 puntos</b>.</li></ul><p class="points-guide-note">Si planificas 2 o 3 actividades y completas solo 1, ganas 0 puntos. El tiempo estimado no afecta el puntaje. Estos puntos miden cumplimiento, no tu satisfacción personal.</p></section>
        <div class="form-actions"><button class="button button-secondary" type="button" data-nav="dashboard">Cancelar</button><button class="button button-primary" type="submit">Guardar plan semanal</button></div>
      </form>
      <aside class="gentle-reminder"><span aria-hidden="true">♡</span><p><strong>Elige metas posibles.</strong> Una meta realista que puedas cumplir suele ayudar más que una lista larga que te agobie.</p></aside>
    </section>`;
}

export function renderGuide() {
  const cards = PILLARS.map((pillar) => `
    <article class="guide-card" style="--pillar-color:${pillar.color};--pillar-soft:${pillar.softColor}">
      <div class="guide-card-heading"><span class="pillar-symbol" aria-hidden="true">${pillar.icon}</span><div><h2>${escapeHTML(pillar.name)}</h2><p>${escapeHTML(pillar.description)}</p></div></div>
      <blockquote>${escapeHTML(pillar.question)}</blockquote>
      <p class="guide-focus">${escapeHTML(pillar.focus)}</p>
      <h3>Ideas para cuidarlo</h3>
      <ul class="tip-list">${pillar.tips.map((tip) => `<li>${escapeHTML(tip)}</li>`).join('')}</ul>
      <div class="examples-block"><span class="eyebrow">EJEMPLOS DE ACTIVIDADES</span><ul>${pillar.examples.map((example) => `<li>${escapeHTML(example)}</li>`).join('')}</ul></div>
      <button class="button button-secondary button-small" type="button" data-action="open-goals" data-pillar-id="${pillar.id}">Crear metas para este pilar →</button>
    </article>`).join('');
  return `<section class="page page-enter"><div class="page-heading"><span class="eyebrow">GUÍA DE USO</span><h1>Cuida cada pilar a tu manera.</h1><p>Estas ideas son puntos de partida, no reglas rígidas. Escoge lo que tenga sentido para tu situación.</p></div><section class="points-guide guide-points-guide" aria-labelledby="guide-points-title"><h2 id="guide-points-title">Guía rápida de puntos semanales</h2><p>Los puntos dependen de las actividades planificadas y completadas en cada pilar.</p><div class="points-guide-grid"><div><strong>1 actividad</strong><span>Completa 1 → 1 punto</span></div><div><strong>2 actividades</strong><span>Completa 2 → 1 punto</span></div><div><strong>3 actividades</strong><span>Completa 2 → 1 punto · Completa 3 → 2 puntos</span></div></div><p class="points-guide-note">Si tienes un plan de 2 o 3 actividades y completas solo 1, obtienes 0 puntos. El tiempo estimado es opcional y no suma puntos. La satisfacción del pilar se evalúa por separado, del 1 al 10.</p></section><div class="guide-grid">${cards}</div><div class="guide-disclaimer"><strong>Recuerda:</strong> una puntuación baja no significa que hayas fallado. Puede señalar una parte de tu vida que merece atención, apoyo o un plan diferente.</div></section>`;
}

export function renderHistory(state) {
  const evaluations = [...state.evaluations].reverse();
  const evaluationCards = evaluations.length ? evaluations.map((evaluation, index) => {
    const previous = state.evaluations[state.evaluations.indexOf(evaluation) - 1];
    const typeLabel = evaluation.type === 'baseline' ? 'Evaluación inicial' : 'Reevaluación manual';
    const scores = PILLARS.map((pillar) => {
      const score = evaluation.scores[pillar.id];
      const band = getScoreBand(score);
      const before = previous?.scores?.[pillar.id];
      let delta = '';
      if (Number.isInteger(before)) {
        const change = score - before;
        delta = `<span class="change-pill ${change > 0 ? 'change-up' : change < 0 ? 'change-down' : 'change-same'}">${change > 0 ? '+' : ''}${change}</span>`;
      }
      return `<div class="history-score-row"><span class="history-score-name">${escapeHTML(pillar.name)}</span><div class="history-mini-track"><span style="width:${score * 10}%;background:${band.color}"></span></div><strong>${score}/10</strong>${delta}</div>`;
    }).join('');
    return `<article class="evaluation-history-card"><div class="history-card-heading"><div><span class="eyebrow">${escapeHTML(typeLabel)}</span><h3>${escapeHTML(formatDate(evaluation.date))}</h3></div><span class="history-index">${state.evaluations.length - index}</span></div><div class="history-scores">${scores}</div></article>`;
  }).join('') : '<div class="empty-state"><span aria-hidden="true">◷</span><h2>Aún no hay evaluaciones</h2><p>Cuando completes tu primera evaluación, tus resultados aparecerán aquí.</p><button class="button button-primary" data-action="start-baseline">Evaluar mis pilares</button></div>';

  const plans = Object.entries(state.plans).sort(([a], [b]) => b.localeCompare(a));
  const weeklyCards = plans.length ? plans.map(([weekKey, plan]) => {
    const entries = PILLARS.map((pillar) => {
      const activities = plan.pillars?.[pillar.id]?.activities ?? [];
      if (activities.length === 0) return '';
      const summary = getWeeklySummary(activities);
      return `<div class="weekly-history-pillar"><span class="tiny-pillar-symbol" style="--pillar-color:${pillar.color};--pillar-soft:${pillar.softColor}">${pillar.icon}</span><div class="weekly-history-pillar-name"><strong>${escapeHTML(pillar.name)}</strong><small>${summary.completed}/${summary.total} actividades completadas</small></div><span class="weekly-history-points">${summary.points}/${summary.maxPoints} pts</span></div>`;
    }).filter(Boolean).join('');
    return `<article class="weekly-history-card"><div class="history-card-heading"><div><span class="eyebrow">PLAN SEMANAL</span><h3>${escapeHTML(formatWeekRange(weekKey))}</h3></div><span class="week-status-pill">${weekKey === getWeekKey() ? 'Semana actual' : 'Historial'}</span></div>${entries || '<p class="muted-copy">No hay actividades guardadas para esta semana.</p>'}</article>`;
  }).join('') : '<div class="empty-state compact-empty"><p>Todavía no tienes semanas registradas. Crea tu primer plan desde el panel.</p></div>';

  return `<section class="page page-enter"><div class="page-heading"><span class="eyebrow">TU PROGRESO</span><h1>Tu camino, no una carrera.</h1><p>Compara tus evaluaciones cuando lo necesites y reconoce el esfuerzo que hay detrás de cada paso.</p><div class="history-actions"><button class="button button-primary" type="button" data-action="start-reevaluation">＋ Nueva reevaluación</button><button class="button button-secondary" type="button" data-nav="dashboard">Volver al panel</button></div></div><section class="history-section"><div class="section-heading"><div><h2>Evaluaciones de satisfacción</h2><p>Los valores están en una escala de 1 a 10. Las flechas muestran el cambio frente a la evaluación anterior.</p></div></div><div class="evaluation-history-list">${evaluationCards}</div></section><section class="history-section"><div class="section-heading"><div><h2>Semanas de actividad</h2><p>Los puntos se calculan por pilar y semana; no modifican la satisfacción.</p></div></div><div class="weekly-history-list">${weeklyCards}</div></section></section>`;
}

export function renderSettings(state) {
  const evalCount = state.evaluations.length;
  const planCount = Object.keys(state.plans).length;
  const activities = Object.values(state.plans).reduce((all, plan) => all + Object.values(plan.pillars ?? {}).reduce((sum, pillarPlan) => sum + (pillarPlan.activities?.length ?? 0), 0), 0);
  return `<section class="narrow-page page-enter"><div class="page-heading"><span class="eyebrow">PREFERENCIAS</span><h1>Ajustes y privacidad</h1><p>Administra la información guardada en este navegador.</p></div><article class="settings-card"><div class="settings-icon" aria-hidden="true">▤</div><div><h2>Tus datos locales</h2><p>La aplicación guarda la información en este navegador. No usa cuentas ni envía estos datos a un servidor.</p></div><div class="storage-stats"><div><strong>${evalCount}</strong><span>evaluaciones</span></div><div><strong>${planCount}</strong><span>semanas guardadas</span></div><div><strong>${activities}</strong><span>actividades guardadas</span></div></div></article><article class="settings-card warning-settings"><div class="settings-icon" aria-hidden="true">!</div><div><h2>Borrar información local</h2><p>Esta acción elimina las evaluaciones y los planes de este navegador. No se puede deshacer desde la aplicación. Para conservar una copia, necesitarás una función de exportación que no está incluida en esta versión.</p><button class="button button-danger" type="button" data-action="delete-all-data">Borrar todos mis datos</button></div></article><div class="settings-footer"><p><strong>Versión del esquema:</strong> 1.0</p><p>Si cambias de navegador, perfil o dispositivo, tus datos no se trasladarán automáticamente.</p></div></section>`;
}

export function renderStorageError(message) {
  return `<section class="narrow-page page-enter"><div class="error-card"><div class="error-symbol" aria-hidden="true">!</div><span class="eyebrow">NO SE PUDO CARGAR TU INFORMACIÓN</span><h1>Hay un problema con los datos guardados.</h1><p>${escapeHTML(message)}</p><p>Para evitar perder información sin tu permiso, la aplicación no reemplazó los datos automáticamente. Puedes volver a intentar o eliminar los datos incompatibles para comenzar de nuevo.</p><div class="form-actions"><button class="button button-secondary" type="button" data-action="retry-load">Intentar de nuevo</button><button class="button button-danger" type="button" data-action="reset-corrupt-data">Eliminar datos locales y reiniciar</button></div></div></section>`;
}
