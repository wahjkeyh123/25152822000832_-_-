/**
 * 文件：src/systems/TimeSystem.js
 * 作用：推进回合和时期。这是整局游戏的时钟。
 *
 * 一个回合怎么结束（顺序不要随便调）：
 * 1. 执行安排（GameScene 先调 commitPlan）。
 * 2. 孩子自己的变化：压力慢慢涨、父母满意度慢慢掉、七项属性自然生长、状态生效一次。
 * 3. 检查压力和满意度有没有到头（MoodSystem）。
 * 4. 这一回合如果有事件，先让玩家选完。
 * 5. 还没到这个时期的最后一回合：进入下一回合，精力回复，脑洞重排。
 * 6. 最后一回合：检查「当前期望」。高中就去高考；否则进入下一个时期，发生活费，
 *    初中和高中开头还要问一次「你更想成为什么」。
 */

import { getStage, stageCount } from '../data/stages.js';
import { aspireQuestionFor } from './AspirationSystem.js';
import { gradeExam } from './ExamSystem.js';
import { judgeEnding } from './EndingSystem.js';
import { settleExpect } from './ExpectSystem.js';
import { getEventById, pickEvent } from './EventSystem.js';
import { changeSatisfaction, checkMoodLines, tickStatuses } from './MoodSystem.js';
import { applyGrowth, formatSheetChanges, freshBoard, recoverEnergy, syncSheet } from './SheetSystem.js';
import { applyEffects } from './StatSystem.js';

/** 结束当前回合。返回 { type: 'round' | 'event' | 'next' | 'ending', notices, ... }。 */
export function endRound(state) {
  const settled = settleRound(state);
  const event = pickEvent(state);
  if (event) {
    state.pendingEventId = event.id;
    return { type: 'event', event, ...settled };
  }
  return { ...advance(state), ...settled, notices: [...settled.notices] };
}

/** 回合本身的结算：孩子自己的变化和状态。 */
function settleRound(state) {
  const stage = getStage(state.yearIndex);
  const stats = state.child.stats;
  const drift = { ...(stage.drift || {}) };
  if (stats.stress >= 70) drift.mood = (drift.mood || 0) - 3;
  else if (stats.stress <= 30) drift.mood = (drift.mood || 0) + 2;
  applyEffects(stats, drift);
  changeSatisfaction(state, stage.satDrift || 0);
  const growth = applyGrowth(state.child);
  tickStatuses(state);
  const notices = checkMoodLines(state);
  state.pushLog(`第 ${state.round} 回合过去了：${formatSheetChanges(growth)}`);
  state.roundSerial += 1;
  return { growth, notices };
}

/** 事件选完之后，从这里接着推进。 */
export function resolveEventChoice(state, choiceIndex) {
  const event = getEventById(state.pendingEventId);
  if (!event) return { changes: {}, choice: null, notices: [] };
  const choice = event.choices[choiceIndex];
  if (!choice) return { changes: {}, choice: null, notices: [] };

  if (choice.money) {
    state.household.money = Math.max(0, state.household.money + choice.money);
  }
  applyEffects(state.child.stats, choice.effects || {});
  const changes = syncSheet(state.child, choice.effects || {});
  if (choice.sat) changes.satisfaction = changeSatisfaction(state, choice.sat);
  state.seenEvents.push(event.id);
  state.pendingEventId = null;
  state.pushLog(`${event.title}：${choice.text}`);
  return { changes, choice, notices: checkMoodLines(state) };
}

/** 进入下一回合，或者结束这个时期。 */
export function advance(state) {
  const stage = getStage(state.yearIndex);
  if (state.round < stage.rounds) {
    state.round += 1;
    startRound(state);
    return { type: 'round' };
  }
  return settleStage(state);
}

/** 新回合开始：清掉安排和本回合买过的道具，精力回复，脑洞按压力重排。 */
function startRound(state) {
  state.actionsThisYear = [];
  state.plan = [];
  state.itemsThisRound = [];
  freshBoard(state);
  const gained = recoverEnergy(state);
  const clouds = state.board.filter((key) => key === 'cloud').length;
  const parts = [`第 ${state.round} 回合开始`];
  if (gained > 0) parts.push(`精力回复 ${gained}`);
  if (clouds > 0) parts.push(`压力太大，脑洞里飘来 ${clouds} 朵乌云`);
  state.pushLog(`${parts.join('，')}。`);
}

function settleStage(state) {
  const expectReward = settleExpect(state);

  if (state.yearIndex + 1 >= stageCount()) {
    state.exam = gradeExam(state);
    const verdict = judgeEnding(state);
    state.endingId = verdict.endingId;
    state.career = verdict.careerId;
    return { type: 'ending', endingId: state.endingId, exam: state.exam, expectReward };
  }

  state.yearIndex += 1;
  state.round = 1;
  const next = getStage(state.yearIndex);
  state.household.money += next.allowance;
  startRound(state);
  state.pushLog(`进入${next.grade}，家里进账 ${next.allowance} 元。`);
  state.pendingAspire = aspireQuestionFor(state);
  state.pendingIntro = true;
  return { type: 'next', expectReward, ask: state.pendingAspire };
}
