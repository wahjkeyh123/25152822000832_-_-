/**
 * 文件：src/systems/SheetSystem.js
 * 作用：左边七项属性的加减，以及会改到它们的几个动作：学技能、排安排、挖脑洞、在商店买东西。
 * 事件和时期变化改的是内部四项（学识、体质、心情、压力），按 MIRROR 的比例映到七项上。
 */

import {
  DIG_GAIN_MAX, DIG_GAIN_MIN, ENERGY_MAX, HOLE_ENERGY_COST, ROUND_ENERGY, SCHEDULES_PER_ROUND, SHEET_MAX,
} from '../config/constants.js';
import { BOOK_DISCOUNT } from '../data/aspirations.js';
import { ATTRIBUTES, SHEET_KEYS, SHEET_LABEL } from '../data/attributes.js';
import { buildBoard } from '../data/board.js';
import { getBook } from '../data/books.js';
import { getCareer } from '../data/careers.js';
import { getItem } from '../data/items.js';
import { getSkillById, isLearned, mainEffect } from '../data/skills.js';
import { mulberry32 } from '../utils/rng.js';
import clamp from '../utils/clamp.js';
import { changeSatisfaction, checkMoodLines, statusValue } from './MoodSystem.js';
import { applyEffects } from './StatSystem.js';

/** 点到悟性格时一次加上的悟性。属性格另外给 1 点悟性。 */
const INSIGHT_TILE_GAIN = 5;
const ATTR_TILE_INSIGHT = 1;

/** 商店从初中开门（yearIndex 2）。 */
export const SHOP_OPEN_INDEX = 2;

/** 点到乌云时随机说的一句。乌云不加任何东西，只花精力。 */
const CLOUD_LINES = [
  '{ta}盯着窗外，什么也没想出来。',
  '翻开本子，又合上了。',
  '今天脑子里是灰的。',
  '{ta}说：别问了，我累。',
];

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
    const after = clamp(before + amount, 0, SHEET_MAX);
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
  state.pushLog(`学会了${skill.name}。到「安排」里排进本回合。`);
  return { ok: true, changes: {} };
}

export function schedulesLeft(state) {
  const queued = state.plan?.length || 0;
  return Math.max(0, SCHEDULES_PER_ROUND - queued - state.actionsThisYear.length);
}

/** 先放进本回合安排，结束回合时才真正执行。同一种技能可以放多次。 */
export function planSkill(state, skill) {
  if (!state.plan) state.plan = [];
  if (!isLearned(state, skill)) return { ok: false, reason: '还没学会' };
  if (schedulesLeft(state) <= 0) return { ok: false, reason: '这一回合已排满' };
  state.plan.push(skill.id);
  state.pushLog(`本回合安排：${skill.name}（${state.plan.length}/${SCHEDULES_PER_ROUND}）`);
  return { ok: true };
}

/** 照上回合的安排再排一遍。已经不会的技能（比如换期后打零工）会跳过。 */
export function repeatLastPlan(state) {
  state.plan = [];
  let count = 0;
  (state.lastPlan || []).forEach((id) => {
    const skill = getSkillById(id);
    if (skill && isLearned(state, skill) && schedulesLeft(state) > 0) {
      state.plan.push(id);
      count += 1;
    }
  });
  return { ok: count > 0, count, reason: count > 0 ? '' : '上回合没有能沿用的安排' };
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

/** 把右边这一回合的技能按顺序执行，然后清空列表。 */
export function commitPlan(state) {
  const ids = (state.plan || []).slice();
  if (ids.length > 0) state.lastPlan = ids.slice();
  state.plan = [];
  const changes = {};
  let energyGain = 0;
  let money = 0;
  let sat = 0;
  ids.forEach((id) => {
    const skill = getSkillById(id);
    if (!skill) return;
    const result = executeSkill(state, skill);
    if (!result.ok) return;
    Object.entries(result.changes || {}).forEach(([key, value]) => {
      changes[key] = (changes[key] || 0) + value;
    });
    energyGain += result.energyGain || 0;
    money += result.money || 0;
    sat += result.sat || 0;
  });
  if (money) changes.money = money;
  if (sat) changes.satisfaction = sat;
  return { changes, energyGain, money, sat, count: ids.length };
}

/**
 * 一个技能让父母满意多少。表里写了 sat 就用表里的；
 * 没写时：学习类 +3，出风头类 +2，纯放松 -1，其他 +1。
 */
export function skillSatisfaction(skill) {
  if (skill.sat !== undefined) return skill.sat;
  if ((skill.core?.study ?? 0) > 0) return 3;
  const main = mainEffect(skill);
  if (main && (main.key === 'face' || main.key === 'charm')) return 2;
  if (skill.energy > 0) return -1;
  return 1;
}

/** 状态会改技能效果：心力交瘁减半，家里和睦主加属性 +2。 */
export function skillEffects(state, skill) {
  const scale = statusValue(state, 'gainScale', 1);
  const bonus = statusValue(state, 'skillBonus', 0);
  const main = mainEffect(skill);
  const effects = {};
  Object.entries(skill.effects || {}).forEach(([key, value]) => {
    const raw = value + (main && key === main.key ? bonus : 0);
    effects[key] = Math.max(1, Math.round(raw * scale));
  });
  return effects;
}

/** 安排里执行一个已经学会的技能。放松技能会把精力加回来，打零工会加积蓄。 */
export function executeSkill(state, skill) {
  if (!isLearned(state, skill)) return { ok: false, reason: '还没学会' };
  if (state.actionsThisYear.length >= SCHEDULES_PER_ROUND) return { ok: false, reason: '这一回合已安排满' };
  state.actionsThisYear.push(skill.id);
  const changes = applySheet(state.child.sheet, skillEffects(state, skill));
  if (skill.core) {
    Object.entries(applyEffects(state.child.stats, skill.core)).forEach(([key, value]) => {
      if (key === 'stress') changes.stress = value;
    });
  }
  let energyGain = 0;
  if (skill.energy) {
    const before = state.household.energy;
    state.household.energy = Math.min(state.household.energyMax, before + skill.energy);
    energyGain = state.household.energy - before;
  }
  const money = skill.money || 0;
  if (money) state.household.money += money;
  const sat = changeSatisfaction(state, skillSatisfaction(skill), { scaled: true });
  const parts = [];
  const sheetPart = Object.fromEntries(Object.entries(changes).filter(([key]) => key !== 'stress'));
  if (Object.keys(sheetPart).length > 0) parts.push(formatSheetChanges(sheetPart));
  if (energyGain > 0) parts.push(`精力+${energyGain}`);
  if (money) parts.push(`积蓄+${money}`);
  state.pushLog(`${skill.name}：${parts.join('，') || '属性不变'}`);
  return { ok: true, changes, energyGain, money, sat };
}

export function shopOpen(state) {
  return state.yearIndex >= SHOP_OPEN_INDEX;
}

/** 书价。志向方向的书打八折。 */
export function bookPrice(state, book) {
  const career = getCareer(book.career);
  const direction = state.aspiration?.direction;
  if (career && direction && career.direction === direction) {
    return Math.round(book.price * BOOK_DISCOUNT);
  }
  return book.price;
}

/** 用积蓄买一本职业书。买到后，这个职业的两项技能出现在「职业」标签页里。 */
export function buyBook(state, bookId) {
  if (!shopOpen(state)) return { ok: false, reason: '商店初中才开门' };
  const book = getBook(bookId);
  if (!book) return { ok: false, reason: '没有这本书' };
  if (state.books.includes(book.id)) return { ok: false, reason: '已经买过了' };
  const price = bookPrice(state, book);
  if (state.household.money < price) return { ok: false, reason: '积蓄不够' };
  state.household.money -= price;
  state.books.push(book.id);
  state.pushLog(`买了${book.name}，积蓄-${price}。右边「职业」里多了两项技能。`);
  return { ok: true, price, changes: { money: -price } };
}

/** 买一个道具，立刻用掉。每个道具每回合只能买一次。 */
export function buyItem(state, itemId) {
  if (!shopOpen(state)) return { ok: false, reason: '商店初中才开门' };
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: '没有这个道具' };
  if (state.itemsThisRound.includes(item.id)) return { ok: false, reason: '这回合已经买过了' };
  if (state.household.money < item.price) return { ok: false, reason: '积蓄不够' };
  state.household.money -= item.price;
  state.itemsThisRound.push(item.id);
  const changes = { money: -item.price };
  Object.entries(applyEffects(state.child.stats, item.core || {})).forEach(([key, value]) => {
    if (key === 'stress' || key === 'mood') changes[key] = value;
  });
  Object.assign(changes, applySheet(state.child.sheet, item.sheet || {}));
  if (item.sat) changes.satisfaction = changeSatisfaction(state, item.sat);
  state.pushLog(`用了${item.name}：${item.detail}`);
  const notices = checkMoodLines(state);
  return { ok: true, changes, notices };
}

/** 新回合回复精力。状态会多回或少回。 */
export function recoverEnergy(state) {
  const household = state.household;
  const gain = Math.max(0, ROUND_ENERGY + statusValue(state, 'energyBonus', 0));
  const before = household.energy;
  household.energy = Math.min(household.energyMax || ENERGY_MAX, before + gain);
  return household.energy - before;
}

/** 某一格属性格会加几点。按种子和回合固定，刷新页面不会变。 */
export function digGain(state, index) {
  const random = mulberry32((state.seed * 31 + state.roundSerial * 977 + index * 13) >>> 0);
  return DIG_GAIN_MIN + Math.floor(random() * (DIG_GAIN_MAX - DIG_GAIN_MIN + 1));
}

/** 点开脑洞图上的一格。消耗 5 点精力。属性格随机 +3~5，悟性格 +5 悟性。 */
export function digHole(state, index) {
  if (!Array.isArray(state.board) || index < 0 || index >= state.board.length) {
    return { ok: false, reason: '没有这一格' };
  }
  if (state.dug.includes(index)) return { ok: false, reason: '这里挖过了' };
  if (state.household.energy < HOLE_ENERGY_COST) return { ok: false, reason: '精力不够了，结束回合会回复' };
  const key = state.board[index];
  state.household.energy -= HOLE_ENERGY_COST;
  state.dug.push(index);
  if (key === 'cloud') {
    const line = CLOUD_LINES[(index + state.dug.length) % CLOUD_LINES.length];
    state.pushLog(`脑洞·乌云：精力-${HOLE_ENERGY_COST}。${line}`);
    return { ok: true, changes: {}, cloud: true };
  }
  const household = state.household;
  if (key === 'insight') {
    const before = household.insight;
    household.insight = Math.min(household.insightMax, before + INSIGHT_TILE_GAIN);
    const gained = household.insight - before;
    state.pushLog(`脑洞·悟性：悟性+${gained}`);
    return { ok: true, changes: { insight: gained } };
  }
  const attr = ATTRIBUTES.find((item) => item.key === key);
  if (!attr) return { ok: false, reason: '没有这一关' };
  const amount = Math.max(1, Math.round((digGain(state, index) + statusValue(state, 'digBonus', 0))
    * statusValue(state, 'gainScale', 1)));
  const changes = applySheet(state.child.sheet, { [key]: amount });
  const before = household.insight;
  household.insight = Math.min(household.insightMax, before + ATTR_TILE_INSIGHT);
  if (household.insight > before) changes.insight = household.insight - before;
  state.pushLog(`脑洞·${attr.label}+${changes[key] ?? 0}`);
  return { ok: true, changes };
}

/** 新回合的脑洞图。压力越高，乌云越多。 */
export function freshBoard(state) {
  state.board = buildBoard(state.seed, state.roundSerial, state.child.stats.stress);
  state.dug = [];
}
