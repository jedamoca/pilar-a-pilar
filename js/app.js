import { initPwa } from './pwa.js';
import { PILLARS, PILLAR_BY_ID } from './pillars.js';
import { getWeekKey } from './dates.js';
import { loadState, saveState, clearState, createInitialState } from './storage.js';
import {
  renderWelcome,
  renderAssessment,
  renderDashboard,
  renderGoals,
  renderGuide,
  renderHistory,
  renderSettings,
  renderStorageError,
  renderActivityRow
} from './views.js';

const main = document.querySelector('#main-content');
const mainNav = document.querySelector('#main-nav');
const mobileMenuButton = document.querySelector('#mobile-menu-button');
const toastRegion = document.querySelector('#toast-region');

let state = null;
let currentScreen = 'welcome';
let currentPillarId = PILLARS[0].id;
let assessmentDraft = null;
let loadError = '';

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast-error' : ''}`;
  toast.setAttribute('role', isError ? 'alert' : 'status');
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 4600);
}

function getNavName(screen) {
  if (screen === 'goals') return 'dashboard';
  return screen;
}

function render() {
  if (loadError) {
    main.innerHTML = renderStorageError(loadError);
  } else if (!state) {
    main.innerHTML = renderStorageError('La aplicación no pudo inicializar el almacenamiento local.');
  } else {
    switch (currentScreen) {
      case 'welcome':
        main.innerHTML = renderWelcome(state.evaluations.length > 0);
        break;
      case 'assessment':
        main.innerHTML = renderAssessment(assessmentDraft);
        break;
      case 'dashboard':
        main.innerHTML = renderDashboard(state);
        break;
      case 'goals':
        main.innerHTML = renderGoals(state, currentPillarId);
        break;
      case 'guide':
        main.innerHTML = renderGuide();
        break;
      case 'history':
        main.innerHTML = renderHistory(state);
        break;
      case 'settings':
        main.innerHTML = renderSettings(state);
        break;
      default:
        currentScreen = state.evaluations.length ? 'dashboard' : 'welcome';
        render();
        return;
    }
  }

  const showNavigation = Boolean(state?.evaluations?.length) && !loadError && !['welcome', 'assessment'].includes(currentScreen);
  mainNav.hidden = !showNavigation;
  mobileMenuButton.hidden = !showNavigation;
  mainNav.classList.remove('is-open');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-label', 'Abrir navegación');
  for (const link of mainNav.querySelectorAll('[data-nav]')) {
    link.classList.toggle('is-active', link.dataset.nav === getNavName(currentScreen));
  }
}

function commit(mutator, successMessage = '') {
  if (!state || loadError) return false;
  try {
    const nextState = structuredClone(state);
    mutator(nextState);
    const savedState = saveState(nextState);
    state = savedState;
    if (successMessage) showToast(successMessage);
    return true;
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.', true);
    return false;
  }
}

function navigate(screen) {
  if (loadError) return;
  if (screen === 'dashboard' && !state?.evaluations?.length) {
    currentScreen = 'welcome';
  } else if (screen === 'welcome') {
    currentScreen = 'welcome';
  } else if (screen === 'assessment') {
    return;
  } else {
    currentScreen = screen;
  }
  render();
}

function startAssessment(type) {
  if (type === 'baseline' && state.evaluations.length > 0) {
    showToast('Ya existe una evaluación inicial. Usa la opción de reevaluación para registrar un nuevo resultado.', true);
    return;
  }
  if (type === 'manual' && state.evaluations.length === 0) {
    type = 'baseline';
  }
  assessmentDraft = { type, index: 0, scores: {} };
  currentScreen = 'assessment';
  render();
  main.focus({ preventScroll: true });
}

function updateScore(score) {
  if (!assessmentDraft || !Number.isInteger(score) || score < 1 || score > 10) return;
  const pillar = PILLARS[assessmentDraft.index];
  assessmentDraft.scores[pillar.id] = score;
  render();
}

function finishAssessment() {
  if (!assessmentDraft) return;
  const missing = PILLARS.find((pillar) => !Number.isInteger(assessmentDraft.scores[pillar.id]));
  if (missing) {
    showToast(`Selecciona una puntuación para «${missing.name}» antes de continuar.`, true);
    return;
  }
  if (assessmentDraft.type === 'baseline' && state.evaluations.some((evaluation) => evaluation.type === 'baseline')) {
    showToast('La evaluación inicial ya existe. Inicia una reevaluación manual.', true);
    return;
  }
  const evaluation = {
    id: makeId(),
    date: localDateKey(new Date()),
    type: assessmentDraft.type,
    scores: Object.fromEntries(PILLARS.map((pillar) => [pillar.id, assessmentDraft.scores[pillar.id]]))
  };
  const saved = commit((nextState) => nextState.evaluations.push(evaluation));
  if (!saved) return;
  const wasBaseline = evaluation.type === 'baseline';
  assessmentDraft = null;
  currentScreen = 'dashboard';
  render();
  showToast(wasBaseline ? 'Evaluación inicial guardada. Este es tu punto de partida.' : 'Reevaluación guardada. Tus resultados anteriores se conservaron.');
}

function openGoals(pillarId) {
  if (!PILLAR_BY_ID[pillarId]) {
    showToast('No se encontró ese pilar.', true);
    return;
  }
  currentPillarId = pillarId;
  currentScreen = 'goals';
  render();
}

function renumberActivityRows() {
  const rows = [...main.querySelectorAll('[data-activity-row]')];
  rows.forEach((row, index) => {
    const number = row.querySelector('.activity-number');
    if (number) number.textContent = `Actividad ${index + 1}`;
    const remove = row.querySelector('[data-action="remove-activity"]');
    if (remove) remove.setAttribute('aria-label', `Eliminar actividad ${index + 1}`);
  });
  const count = rows.filter((row) => row.querySelector('[data-field="activity-text"]')?.value.trim()).length;
  const counter = main.querySelector('#activity-counter');
  if (counter) counter.textContent = `${count}/3`;
  const addButton = main.querySelector('[data-action="add-activity"]');
  if (addButton) addButton.disabled = rows.length >= 3;
  const list = main.querySelector('#activity-list');
  if (list && rows.length === 0) {
    list.innerHTML = '<p class="muted-copy empty-activity-note">Todavía no hay actividades. Usa «Agregar actividad» para crear tu plan.</p>';
  }
}

function saveGoals({ quiet = false } = {}) {
  const form = main.querySelector('#goals-form');
  if (!form) return false;
  const pillarId = form.dataset.pillarId;
  const weekKey = form.dataset.weekKey;
  if (!PILLAR_BY_ID[pillarId] || weekKey !== getWeekKey()) {
    showToast('No se pudo confirmar la semana del plan. Recarga la pantalla e inténtalo de nuevo.', true);
    return false;
  }
  const existing = state.plans[weekKey]?.pillars?.[pillarId]?.activities ?? [];
  const existingById = new Map(existing.map((activity) => [activity.id, activity]));
  const rows = [...form.querySelectorAll('[data-activity-row]')];
  const activities = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const text = row.querySelector('[data-field="activity-text"]')?.value.trim() ?? '';
    const minutesRaw = row.querySelector('[data-field="activity-minutes"]')?.value.trim() ?? '';
    const completed = row.querySelector('[data-field="completed"]')?.checked === true;
    const oldId = row.dataset.id || '';

    if (text === '' && minutesRaw === '' && !completed) continue;
    if (text === '') {
      showToast(`Escribe una descripción para la actividad ${index + 1}.`, true);
      row.querySelector('[data-field="activity-text"]')?.focus();
      return false;
    }
    if (text.length > 180) {
      showToast(`La actividad ${index + 1} debe tener como máximo 180 caracteres.`, true);
      return false;
    }
    let minutes = null;
    if (minutesRaw !== '') {
      minutes = Number(minutesRaw);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) {
        showToast(`El tiempo de la actividad ${index + 1} debe ser un entero entre 1 y 10080 minutos, o puedes dejarlo vacío.`, true);
        row.querySelector('[data-field="activity-minutes"]')?.focus();
        return false;
      }
    }
    const old = existingById.get(oldId);
    const completedAt = completed ? (old?.completed && old.completedAt ? old.completedAt : new Date().toISOString()) : null;
    activities.push({ id: oldId || makeId(), text, estimatedMinutes: minutes, completed, completedAt });
  }

  if (activities.length > 3) {
    showToast('Cada pilar permite un máximo de tres actividades por semana.', true);
    return false;
  }
  if (activities.length === 0 && existing.length === 0) {
    showToast('Agrega al menos una actividad antes de guardar tu plan semanal.', true);
    return false;
  }

  const saved = commit((nextState) => {
    if (activities.length === 0) {
      const existingWeek = nextState.plans[weekKey];
      if (existingWeek?.pillars) delete existingWeek.pillars[pillarId];
      if (existingWeek && Object.keys(existingWeek.pillars).length === 0) delete nextState.plans[weekKey];
      return;
    }
    if (!nextState.plans[weekKey]) nextState.plans[weekKey] = { weekStart: weekKey, pillars: {} };
    nextState.plans[weekKey].pillars[pillarId] = { activities };
  }, quiet ? '' : 'Plan semanal guardado.');

  if (saved) {
    currentScreen = 'goals';
    currentPillarId = pillarId;
    render();
    if (quiet) showToast('Actividad actualizada.');
  } else {
    render();
  }
  return saved;
}

function copyPreviousPlan(pillarId) {
  const weekKey = getWeekKey();
  const currentActivities = state.plans[weekKey]?.pillars?.[pillarId]?.activities ?? [];
  if (currentActivities.length > 0) {
    showToast('Ya tienes actividades esta semana. Edita el plan actual para evitar duplicados.', true);
    return;
  }
  const priorWeekKey = Object.keys(state.plans)
    .filter((key) => key < weekKey && state.plans[key]?.pillars?.[pillarId]?.activities?.length)
    .sort()
    .at(-1);
  if (!priorWeekKey) {
    showToast('No se encontró un plan anterior para este pilar.', true);
    return;
  }
  const previousActivities = state.plans[priorWeekKey].pillars[pillarId].activities;
  const copied = previousActivities.map((activity) => ({
    id: makeId(), text: activity.text, estimatedMinutes: activity.estimatedMinutes, completed: false, completedAt: null
  }));
  const saved = commit((nextState) => {
    if (!nextState.plans[weekKey]) nextState.plans[weekKey] = { weekStart: weekKey, pillars: {} };
    nextState.plans[weekKey].pillars[pillarId] = { activities: copied };
  });
  if (saved) {
    render();
    showToast(`Se copiaron ${copied.length} actividades sin marcar como completadas. Revisa tu plan de esta semana.`);
  }
}

function deleteAllData() {
  const confirmed = window.confirm('¿Seguro que quieres borrar todas tus evaluaciones y planes de este navegador? Esta acción no se puede deshacer.');
  if (!confirmed) return;
  try {
    clearState();
    state = createInitialState();
    assessmentDraft = null;
    loadError = '';
    currentScreen = 'welcome';
    render();
    showToast('Se borraron los datos locales de Pilar a Pilar.');
  } catch (error) {
    showToast(error.message || 'No se pudieron borrar los datos.', true);
  }
}

function resetCorruptData() {
  const confirmed = window.confirm('Los datos actuales no se pueden usar. ¿Quieres eliminarlos y comenzar de nuevo? Esta acción no se puede deshacer.');
  if (!confirmed) return;
  try {
    clearState();
    state = createInitialState();
    state = saveState(state);
    loadError = '';
    currentScreen = 'welcome';
    assessmentDraft = null;
    render();
    showToast('Se reiniciaron los datos locales. Ya puedes empezar una nueva evaluación.');
  } catch (error) {
    showToast(error.message || 'No se pudieron reiniciar los datos.', true);
  }
}

function retryLoad() {
  try {
    state = loadState();
    loadError = '';
    currentScreen = state.evaluations.length ? 'dashboard' : 'welcome';
    render();
    showToast('Se pudieron cargar los datos.');
  } catch (error) {
    loadError = error.message || 'No se pudieron cargar los datos.';
    render();
  }
}

function handleAction(actionButton) {
  const action = actionButton.dataset.action;
  switch (action) {
    case 'start-baseline':
      startAssessment('baseline');
      break;
    case 'start-reevaluation':
      startAssessment('manual');
      break;
    case 'dashboard':
      navigate('dashboard');
      break;
    case 'choose-score':
      updateScore(Number(actionButton.dataset.score));
      break;
    case 'previous-question':
      if (assessmentDraft && assessmentDraft.index > 0) {
        assessmentDraft.index -= 1;
        render();
      }
      break;
    case 'next-question':
      if (!assessmentDraft) break;
      if (!Number.isInteger(assessmentDraft.scores[PILLARS[assessmentDraft.index].id])) {
        showToast('Selecciona una puntuación antes de continuar.', true);
        break;
      }
      if (assessmentDraft.index < PILLARS.length - 1) {
        assessmentDraft.index += 1;
        render();
      }
      break;
    case 'finish-assessment':
      finishAssessment();
      break;
    case 'cancel-assessment':
      assessmentDraft = null;
      currentScreen = state.evaluations.length ? 'dashboard' : 'welcome';
      render();
      break;
    case 'open-goals':
      openGoals(actionButton.dataset.pillarId);
      break;
    case 'view-goals': {
      const pillarId = actionButton.dataset.pillarId;
      const activities = state.plans[getWeekKey()]?.pillars?.[pillarId]?.activities ?? [];
      if (activities.length === 0) showToast('Todavía no tienes metas para este pilar esta semana. Puedes crear hasta tres actividades.');
      openGoals(pillarId);
      break;
    }
    case 'add-activity': {
      const list = main.querySelector('#activity-list');
      const rows = [...main.querySelectorAll('[data-activity-row]')];
      if (!list || rows.length >= 3) {
        showToast('Puedes tener un máximo de tres actividades por pilar.', true);
        break;
      }
      if (rows.length === 0) list.innerHTML = '';
      list.insertAdjacentHTML('beforeend', renderActivityRow(null, rows.length));
      renumberActivityRows();
      list.querySelectorAll('[data-activity-row] input')[0]?.focus();
      break;
    }
    case 'remove-activity': {
      const row = actionButton.closest('[data-activity-row]');
      row?.remove();
      renumberActivityRows();
      break;
    }
    case 'copy-previous-plan':
      copyPreviousPlan(actionButton.dataset.pillarId);
      break;
    case 'delete-all-data':
      deleteAllData();
      break;
    case 'retry-load':
      retryLoad();
      break;
    case 'reset-corrupt-data':
      resetCorruptData();
      break;
    default:
      break;
  }
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    navigate(nav.dataset.nav);
    return;
  }
  const action = event.target.closest('[data-action]');
  if (action) handleAction(action);
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'goals-form') {
    event.preventDefault();
    saveGoals();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[data-field="completed"]')) {
    saveGoals({ quiet: true });
  }
  if (event.target.matches('[data-field="activity-text"]')) {
    renumberActivityRows();
  }
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-field="activity-text"]')) renumberActivityRows();
});

mobileMenuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
  mobileMenuButton.setAttribute('aria-label', isOpen ? 'Cerrar navegación' : 'Abrir navegación');
});

try {
  state = loadState();
  currentScreen = state.evaluations.length ? 'dashboard' : 'welcome';
} catch (error) {
  loadError = error.message || 'No se pudo acceder a los datos guardados.';
  currentScreen = 'error';
}
render();

initPwa({ onMessage: (message, isError = false) => showToast(message, isError) });
