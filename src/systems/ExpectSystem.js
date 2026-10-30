/**
 * 文件：src/systems/ExpectSystem.js
 * 作用：每个时期的「当前期望」。时期最后一回合结束时检查一次，达到就发奖励。
 * 达到了父母满意度 +15，没达到 -10。期望写在 src/data/stages.js 的 expect 里。
 * 当期已经达到目标时，点左下角那一块还能再领一笔额外奖励，每期一次。
 */

import { SHEET_LABEL } from '../data/attributes.js';
import { getStage } from '../data/stages.js';
import { changeSatisfaction } from './MoodSystem.js';
import { applySheet } from './SheetSystem.js';

const SAT_HIT = 15;
const SAT_MISS = -10;

/** 给界面用：标题、属性名、当前值、目标、奖励说明、是否已经达到。 */
export function expectProgress(state) {
  const stage = getStage(state.yearIndex);
  const expect = stage.expect;
  if (!expect) return null;
  const value = state.child.sheet[expect.key] ?? 0;
  return {
    title: expect.title,
    label: SHEET_LABEL[expect.key],
    value,
    target: expect.target,
    reward: rewardText(expect.reward),
    reached: value >= expect.target,
    done: state.expectDone.includes(stage.id),
    bonusClaimed: (state.expectBonusClaimed || []).includes(stage.id),
    roundsLeft: stage.rounds - state.round,
  };
}

/** 达到目标后点一下，额外发一笔。每期只能领一次，和期末那次结算分开。 */
export function claimExpectBonus(state) {
  const stage = getStage(state.yearIndex);
  const progress = expectProgress(state);
  if (!progress) return { ok: false, reason: '这一期没有期望' };
  if (!progress.reached) return { ok: false, reason: '还没达到，先把这项养上去' };
  state.expectBonusClaimed = state.expectBonusClaimed || [];
  if (state.expectBonusClaimed.includes(stage.id)) {
    return { ok: false, reason: '额外奖励已经领过了' };
  }
  const reward = stage.expect.reward || {};
  const insight = 3 + Math.floor((reward.insight || 0) / 2);
  const money = 12 + Math.floor((reward.money || 0) / 2);
  state.household.insight += insight;
  state.household.money += money;
  const satisfaction = changeSatisfaction(state, 6);
  const sheet = applySheet(state.child.sheet, { [stage.expect.key]: 6 });
  state.expectBonusClaimed.push(stage.id);
  state.pushLog(`点开期望「${progress.title}」，额外领了悟性+${insight}、积蓄+${money}。`);
  return { ok: true, changes: { insight, money, satisfaction, ...sheet } };
}

export function rewardText(reward = {}) {
  const parts = [];
  if (reward.insight) parts.push(`悟性+${reward.insight}`);
  if (reward.money) parts.push(`积蓄+${reward.money}`);
  parts.push(`满意度+${SAT_HIT}`);
  return parts.join('，');
}

/** 时期结束时调用。达到了就发奖励并记一笔，返回发了什么。 */
export function settleExpect(state) {
  const stage = getStage(state.yearIndex);
  const expect = stage.expect;
  if (!expect || state.expectDone.includes(stage.id)) return null;
  const value = state.child.sheet[expect.key] ?? 0;
  if (value < expect.target) {
    changeSatisfaction(state, SAT_MISS);
    state.pushLog(`期望「${expect.title}」没达到：${SHEET_LABEL[expect.key]} ${value}/${expect.target}，父母满意度${SAT_MISS}。`);
    return null;
  }
  const reward = expect.reward || {};
  const household = state.household;
  if (reward.insight) household.insight += reward.insight;
  if (reward.money) household.money += reward.money;
  changeSatisfaction(state, SAT_HIT);
  state.expectDone.push(stage.id);
  state.pushLog(`达成期望「${expect.title}」：${rewardText(reward)}。`);
  return { ...reward, satisfaction: SAT_HIT };
}
