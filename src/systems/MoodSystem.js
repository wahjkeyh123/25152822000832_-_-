/**
 * 文件：src/systems/MoodSystem.js
 * 作用：父母满意度、孩子压力这两条线，以及它们触发的状态。
 * 状态的数值写在 src/data/statuses.js。这里只管「什么时候加上、怎么生效、何时消失」。
 *
 * 触发规则：
 * - 压力到 100：心力交瘁。
 * - 压力到 0：无忧无虑。
 * - 满意度到 100：随机两三项属性 +4~8、积蓄 +30~50，再加「家里和睦」，满意度回到 60。
 * - 满意度到 0：家里冷冰冰，满意度回到 20。
 */

import { SAT_MAX } from '../config/constants.js';
import { SHEET_KEYS, SHEET_LABEL } from '../data/attributes.js';
import { getStatus } from '../data/statuses.js';
import { mulberry32 } from '../utils/rng.js';
import clamp from '../utils/clamp.js';
import { applySheet } from './SheetSystem.js';
import { applyEffects } from './StatSystem.js';

const SAT_REFILL = 60;
const SAT_FLOOR_RESET = 20;

export function hasStatus(state, id) {
  return state.statuses.some((item) => item.id === id);
}

/** 当前所有状态的某个效果。乘法类的连乘，加法类的相加。 */
export function statusValue(state, field, fallback) {
  const multiply = field.endsWith('Scale');
  return state.statuses.reduce((value, item) => {
    const def = getStatus(item.id);
    if (!def || def[field] === undefined) return value;
    return multiply ? value * def[field] : value + def[field];
  }, fallback);
}

function addStatus(state, id) {
  const def = getStatus(id);
  if (!def) return null;
  const existing = state.statuses.find((item) => item.id === id);
  if (existing) existing.rounds = def.rounds;
  else state.statuses.push({ id, rounds: def.rounds });
  return def;
}

/** 改满意度。cold 状态下，正向的变化减半。返回实际变化。 */
export function changeSatisfaction(state, amount, { scaled = false } = {}) {
  let delta = amount;
  if (scaled && delta > 0) delta = Math.round(delta * statusValue(state, 'satScale', 1));
  const household = state.household;
  const before = household.satisfaction;
  household.satisfaction = clamp(before + delta, 0, SAT_MAX);
  return household.satisfaction - before;
}

/**
 * 检查两条线有没有碰到头。返回要弹给玩家看的提示，每条是 { kind, title, text, changes }。
 * 在回合结束、用道具、事件选完之后都调一次。
 */
export function checkMoodLines(state) {
  const notices = [];
  const stress = state.child.stats.stress;
  if (stress >= 100 && !hasStatus(state, 'overwhelmed')) {
    const def = addStatus(state, 'overwhelmed');
    state.pushLog(`{name}压力满了，进入「${def.label}」。`);
    notices.push({ kind: 'bad', title: def.label, text: def.desc });
  }
  if (stress <= 0 && !hasStatus(state, 'carefree')) {
    const def = addStatus(state, 'carefree');
    state.pushLog(`{name}一点压力都没有了，进入「${def.label}」。`);
    notices.push({ kind: 'good', title: def.label, text: def.desc });
  }

  const household = state.household;
  if (household.satisfaction >= SAT_MAX) {
    const reward = rollReward(state);
    household.money += reward.money;
    const changes = applySheet(state.child.sheet, reward.sheet);
    household.satisfaction = SAT_REFILL;
    const def = addStatus(state, 'harmony');
    const names = Object.entries(changes).map(([key, value]) => `${SHEET_LABEL[key]}+${value}`).join('，');
    state.pushLog(`父母满意度满了：${names}，积蓄+${reward.money}，进入「${def.label}」。`);
    notices.push({
      kind: 'good',
      title: '父母很满意',
      text: `奖励：${names}，积蓄+${reward.money}。\n${def.label}：${def.desc}`,
      changes: { ...changes, money: reward.money },
    });
  }
  if (household.satisfaction <= 0 && !hasStatus(state, 'cold')) {
    household.satisfaction = SAT_FLOOR_RESET;
    const def = addStatus(state, 'cold');
    state.pushLog(`父母满意度见底了，家里进入「${def.label}」。`);
    notices.push({ kind: 'bad', title: def.label, text: def.desc });
  }
  return notices;
}

/** 满意度满了的奖励。用存档里的种子和回合数，刷新页面不会重抽。 */
function rollReward(state) {
  const random = mulberry32((state.seed * 7 + state.roundSerial * 131 + 17) >>> 0);
  const keys = SHEET_KEYS.slice();
  const count = 2 + Math.floor(random() * 2);
  const sheet = {};
  for (let step = 0; step < count; step += 1) {
    const pick = keys.splice(Math.floor(random() * keys.length), 1)[0];
    sheet[pick] = 4 + Math.floor(random() * 5);
  }
  return { sheet, money: 30 + Math.floor(random() * 3) * 10 };
}

/** 回合结束：状态生效一次，再减一回合，到期的拿掉。返回心情 / 压力等的变化。 */
export function tickStatuses(state) {
  const changes = {};
  state.statuses.forEach((item) => {
    const def = getStatus(item.id);
    if (!def?.perRound) return;
    Object.entries(applyEffects(state.child.stats, def.perRound)).forEach(([key, value]) => {
      changes[key] = (changes[key] || 0) + value;
    });
  });
  state.statuses.forEach((item) => {
    item.rounds -= 1;
  });
  const ended = state.statuses.filter((item) => item.rounds <= 0).map((item) => getStatus(item.id)?.label);
  state.statuses = state.statuses.filter((item) => item.rounds > 0);
  if (ended.length > 0) state.pushLog(`「${ended.join('」「')}」结束了。`);
  return changes;
}
