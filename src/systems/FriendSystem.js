/**
 * 文件：src/systems/FriendSystem.js
 * 作用：初中起的三个同学会。亲密度怎么加减、这一回合能不能再找一次，都在这里。
 * 校内随便找；周末要亲密度够、还要付精力和积蓄。
 */

import {
  CLOSENESS_MAX, FRIEND_OPEN_INDEX, closenessOf, emptyFriend, findAction,
  getPal, normalizeFriend, palName, palOwner,
} from '../data/friends.js';
import clamp from '../utils/clamp.js';
import { changeSatisfaction, checkMoodLines } from './MoodSystem.js';
import { applyEffects } from './StatSystem.js';
import { applySheet, syncSheet } from './SheetSystem.js';

export function friendOpen(state) {
  return state.yearIndex >= FRIEND_OPEN_INDEX;
}

export function getFriendAction(id, palId) {
  return findAction(id, palId);
}

export { emptyFriend, closenessOf, palName };

/** 进入初中时叫一次。已经解锁过就不再写日志。 */
export function unlockFriend(state) {
  if (!friendOpen(state)) return false;
  state.friend = normalizeFriend(state.friend);
  if (state.friend.unlocked) return false;
  state.friend.unlocked = true;
  const start = Math.max(state.friend.pals['lin-zhou'].closeness, 8);
  state.friend.pals['lin-zhou'].closeness = start;
  state.friend.closeness = start;
  state.friend.name = palName(state, state.friend.lastId);
  state.pushLog('班里坐到了同桌林舟，后座是顾河，值日搭子是陈勉。');
  return true;
}

export function changeCloseness(state, amount, palId) {
  if (!state.friend || !amount) return 0;
  state.friend = normalizeFriend(state.friend);
  const id = palId || state.friend.lastId || 'lin-zhou';
  if (!state.friend.pals[id]) state.friend.pals[id] = { closeness: 0 };
  const before = state.friend.pals[id].closeness || 0;
  const after = clamp(before + amount, 0, CLOSENESS_MAX);
  state.friend.pals[id].closeness = after;
  if (id === 'lin-zhou') state.friend.closeness = after;
  return after - before;
}

function spendCost(state, action) {
  const energy = action.energy || 0;
  const money = action.money || 0;
  const spend = money < 0 ? -money : 0;
  if (energy && state.household.energy < energy) {
    return { ok: false, reason: '精力不够，约不了周末' };
  }
  if (spend && state.household.money < spend) {
    return { ok: false, reason: '积蓄不够，周末出不了门' };
  }
  return { ok: true, energy, money };
}

/** 本回合找一个人一次。校内或周末。 */
export function actWithFriend(state, actionId, palId) {
  if (!friendOpen(state) || !state.friend?.unlocked) {
    return { ok: false, reason: '朋友初中才出现' };
  }
  state.friend = normalizeFriend(state.friend);
  if (state.friend.actedThisRound) {
    return { ok: false, reason: '这回合已经找过了' };
  }
  const pal = getPal(palId || palOwner(actionId).id);
  const action = findAction(actionId, pal.id);
  if (!action) return { ok: false, reason: '没有这件事' };

  const need = action.need || 0;
  const close = closenessOf(state, pal.id);
  if (need && close < need) {
    return { ok: false, reason: `亲密度到 ${need} 才能约周末` };
  }
  const cost = spendCost(state, action);
  if (!cost.ok) return cost;

  state.friend.actedThisRound = true;
  state.friend.lastId = pal.id;
  state.friend.focusId = pal.id;
  state.friend.name = pal.name;

  if (cost.energy) state.household.energy -= cost.energy;
  if (cost.money) state.household.money = Math.max(0, state.household.money + cost.money);

  applyEffects(state.child.stats, action.effects || {});
  const changes = syncSheet(state.child, action.effects || {});
  if (action.sheet) {
    const extra = applySheet(state.child.sheet, action.sheet);
    Object.entries(extra).forEach(([key, value]) => {
      changes[key] = (changes[key] || 0) + value;
    });
  }
  if (cost.energy) changes.energy = -cost.energy;
  if (cost.money) changes.money = cost.money;
  const closeness = changeCloseness(state, action.closeness || 0, pal.id);
  if (closeness) changes.closeness = closeness;
  if (action.sat) changes.satisfaction = changeSatisfaction(state, action.sat);
  const kind = need ? '周末和' : '和';
  state.pushLog(`${kind}${pal.name}${action.name}。`);
  return { ok: true, changes, notices: checkMoodLines(state) };
}
