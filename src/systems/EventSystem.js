/**
 * 文件：src/systems/EventSystem.js
 * 作用：从事件表里挑出「这一年该出现的那一件」。
 * 已经选过的不会再出现。如果上次关掉网页时卡在选项上，优先把那一件请回来。
 */

import { EVENTS, getEventById } from '../data/events.js';
import { mulberry32 } from '../utils/rng.js';

export function canChoose(state, choice) {
  const spend = choice.money < 0 ? -choice.money : 0;
  return state.household.money >= spend;
}

export function pickEvent(state) {
  if (state.pendingEventId) {
    return getEventById(state.pendingEventId);
  }

  const candidates = EVENTS.filter((event) => {
    if (state.seenEvents.includes(event.id)) return false;
    return event.when(state);
  });
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.priority - a.priority);
  const top = candidates[0].priority;
  const group = candidates.filter((event) => event.priority === top);
  if (group.length === 1) return group[0];

  const roll = mulberry32(state.seed + state.yearIndex * 100)();
  const index = Math.min(group.length - 1, Math.floor(roll * group.length));
  return group[index];
}

export { getEventById };
