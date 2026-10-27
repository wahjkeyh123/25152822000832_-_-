/**
 * 文件：src/systems/SheetSystem.js
 * 作用：左边七项属性的加减。安排仍然改原来的四项，这里负责把结果映到面板上。
 * 技能和脑洞直接改这七项，不再绕一圈。
 */

import { ENERGY_MAX, HOLE_ENERGY_COST, SCHEDULES_PER_ROUND } from '../config/constants.js';
import { ATTRIBUTES, SHEET_KEYS, SHEET_LABEL } from '../data/attributes.js';
import { buildBoard } from '../data/board.js';
import { getSkillById } from '../data/skills.js';
import { applyEffects } from './StatSystem.js';
import clamp from '../utils/clamp.js';

/** 点到悟性格时一次加上的悟性。普通属性格仍是 +2。 */
const INSIGHT_TILE_GAIN = 5;

/** 原来的四项，按这个比例映到面板上。比例写在这里，按钮上的预览才和实际变化一致。 */
const MIRROR = {
  study: [['iq', 1], ['memory', 0.5]],
  body: [['physique', 1]],
  mood: [['eq', 0.7], ['charm', 0.4], ['imagination', 0.4]],
  stress: [['face', -0.35]],
};

export function previewSheetChanges(effects = {}) {
  const changes = {};
  Object.entries(MIRROR).forEach(([core, rules]) => {
    const amount = effects[core];
    if (!amount) return;
    rules.forEach(([key, ratio]) => {
      const delta = Math.round(amount * ratio);
      if (!delta) return;
      changes[key] = (changes[key] || 0) + delta;
    });
  });
  return changes;
}

export function applySheet(sheet, effects = {}) {
  const changes = {};
  Object.entries(effects).forEach(([key, amount]) => {
    if (!SHEET_KEYS.includes(key) || !amount) return;
    const before = sheet[key] ?? 0;
    const after = clamp(before + amount, 0, 100);
    sheet[key] = after;
    const delta = after - before;
    if (delta !== 0) changes[key] = (changes[key] || 0) + delta;
  });
  return changes;
}

export function syncSheet(child, effects = {}) {
  return applySheet(child.sheet, previewSheetChanges(effects));
}

export function applyGrowth(child) {
  return applySheet(child.sheet, child.growth || {});
}

export function formatSheetLines(changes = {}, perLine = 2) {
  const parts = [];
  SHEET_KEYS.forEach((key) => {
    if (!changes[key]) return;
    const value = changes[key];
    parts.push(`${SHEET_LABEL[key]}${value > 0 ? '+' : ''}${value}`);
  });
  if (parts.length === 0) parts.push('属性不变');
  const lines = [];
  for (let index = 0; index < parts.length; index += perLine) {
    lines.push(parts.slice(index, index + perLine).join('  '));
  }
  return lines;
}

export function formatSheetChanges(changes = {}) {
  return formatSheetLines(changes, 4).join('，');
}

export function learnSkill(state, skill) {
  if (state.learnedSkills.includes(skill.id)) return { ok: false, reason: '学过了' };
  if (state.household.insight < skill.cost) return { ok: false, reason: '悟性不够' };
  state.household.insight -= skill.cost;
  state.learnedSkills.push(skill.id);
  state.pushLog(`学会了${skill.name}。到安排里排进本轮，还能放 ${schedulesLeft(state)} 个。`);
  return { ok: true, changes: {} };
}

export function schedulesLeft(state) {
  const queued = state.plan?.length || 0;
  return Math.max(0, SCHEDULES_PER_ROUND - queued - state.actionsThisYear.length);
}

/** 先放进本轮安排，结束这个时期时才真正执行。同一种技能可以放多次。 */
export function planSkill(state, skill) {
  if (!state.plan) state.plan = [];
  if (!state.learnedSkills.includes(skill.id)) return { ok: false, reason: '还没学会' };
  if (schedulesLeft(state) <= 0) return { ok: false, reason: '这一轮已排满' };
  state.plan.push(skill.id);
  state.pushLog(`本轮安排：${skill.name}（${state.plan.length}/${SCHEDULES_PER_ROUND}）`);
  return { ok: true };
}

export function unplanAt(state, index) {
  if (!state.plan || index < 0 || index >= state.plan.length) return { ok: false };
  state.plan.splice(index, 1);
  return { ok: true };
}

export function clearPlan(state) {
  state.plan = [];
  return { ok: true };
}

/** 把右边这一轮的技能按顺序执行，然后清空列表。 */
export function commitPlan(state) {
  const ids = (state.plan || []).slice();
  state.plan = [];
  const changes = {};
  let energyGain = 0;
  ids.forEach((id) => {
    const skill = getSkillById(id);
    if (!skill) return;
    const result = executeSkill(state, skill);
    if (!result.ok) return;
    Object.entries(result.changes || {}).forEach(([key, value]) => {
      changes[key] = (changes[key] || 0) + value;
    });
    energyGain += result.energyGain || 0;
  });
  return { changes, energyGain, count: ids.length };
}

/** 安排里执行一个已经学会的技能。放松技能会把精力加回来。 */
export function executeSkill(state, skill) {
  if (!state.learnedSkills.includes(skill.id)) return { ok: false, reason: '还没学会' };
  if (state.actionsThisYear.length >= SCHEDULES_PER_ROUND) return { ok: false, reason: '这一轮已安排满' };
  state.actionsThisYear.push(skill.id);
  const changes = applySheet(state.child.sheet, skill.effects || {});
  if (skill.core) applyEffects(state.child.stats, skill.core);
  let energyGain = 0;
  if (skill.energy) {
    const before = state.household.energy;
    state.household.energy = Math.min(state.household.energyMax, before + skill.energy);
    energyGain = state.household.energy - before;
  }
  const extra = energyGain > 0 ? `，精力+${energyGain}` : '';
  state.pushLog(`${skill.name}：${formatSheetChanges(changes)}${extra}`);
  return { ok: true, changes, energyGain };
}

export function recoverEnergy(household) {
  const gain = Math.round((household.energyMax || ENERGY_MAX) * 0.5);
  const before = household.energy;
  household.energy = Math.min(household.energyMax || ENERGY_MAX, before + gain);
  return household.energy - before;
}

/** 点开脑洞图上的一格。消耗 5 点精力，得到悟性和对应属性。 */
export function digHole(state, index) {
  if (!Array.isArray(state.board) || index < 0 || index >= state.board.length) {
    return { ok: false, reason: '没有这一格' };
  }
  if (state.dug.includes(index)) return { ok: false, reason: '这里挖过了' };
  if (state.household.energy < HOLE_ENERGY_COST) return { ok: false, reason: '精力不够' };
  const key = state.board[index];
  const attr = key === 'insight'
    ? { key: 'insight', label: '悟性' }
    : ATTRIBUTES.find((item) => item.key === key);
  if (!attr) return { ok: false, reason: '没有这一关' };
  state.household.energy -= HOLE_ENERGY_COST;
  state.dug.push(index);
  const bonus = key === 'insight' ? INSIGHT_TILE_GAIN : 2;
  const before = state.household.insight;
  state.household.insight = Math.min(state.household.insightMax, before + bonus);
  const gained = state.household.insight - before;
  const changes = key === 'insight' ? {} : applySheet(state.child.sheet, { [key]: 1 });
  const sheetText = key === 'insight' ? '' : `，${attr.label}+1`;
  state.pushLog(`脑洞·${attr.label}：精力-${HOLE_ENERGY_COST}，悟性+${gained}${sheetText}`);
  return { ok: true, changes, insight: gained };
}

export function freshBoard(state) {
  state.board = buildBoard(state.seed, state.yearIndex);
  state.dug = [];
}
