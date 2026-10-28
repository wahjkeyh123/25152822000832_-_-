/**
 * 文件：src/systems/TimeSystem.js
 * 作用：推进成长时期。这是整局游戏的时钟。
 *
 * 一个时期怎么结束（顺序不要随便调）：
 * 1. 如果这个时期有事件，先让玩家选完。
 * 2. 再结算这个时期自带的变化（stages.js 里的 drift）。
 * 3. 检查这个时期的「当前期望」，达到就发奖励。
 * 4. 如果已经是高中，立刻高考并判断职业结局。
 * 5. 否则进入下一个时期，发生活费，精力回复一半，脑洞图按压力重排。
 *    初中和高中开头还要问一次「你更想成为什么」。
 */

import { getStage, stageCount } from '../data/stages.js';
import { aspireQuestionFor } from './AspirationSystem.js';
import { gradeExam } from './ExamSystem.js';
import { judgeEnding } from './EndingSystem.js';
import { settleExpect } from './ExpectSystem.js';
import { getEventById, pickEvent } from './EventSystem.js';
import { applyGrowth, formatSheetChanges, freshBoard, recoverEnergy, syncSheet } from './SheetSystem.js';
import { applyEffects, formatChanges } from './StatSystem.js';

export function beginYearEnd(state) {
  const event = pickEvent(state);
  if (event) {
    state.pendingEventId = event.id;
    return { type: 'event', event };
  }
  return settleYear(state);
}

export function resolveEventChoice(state, choiceIndex) {
  const event = getEventById(state.pendingEventId);
  if (!event) return { changes: {}, choice: null };
  const choice = event.choices[choiceIndex];
  if (!choice) return { changes: {}, choice: null };

  if (choice.money) {
    state.household.money = Math.max(0, state.household.money + choice.money);
  }
  applyEffects(state.child.stats, choice.effects || {});
  const changes = syncSheet(state.child, choice.effects || {});
  state.seenEvents.push(event.id);
  state.pendingEventId = null;
  state.pushLog(`${event.title}：${choice.text}`);
  return { changes, choice };
}

export function settleYear(state) {
  const current = getStage(state.yearIndex);
  const driftChanges = applyEffects(state.child.stats, current.drift || {});
  syncSheet(state.child, current.drift || {});
  const growthChanges = applyGrowth(state.child);
  state.pushLog(`${current.grade}过去了：${formatChanges(driftChanges)}`);
  if (Object.keys(growthChanges).length > 0) {
    state.pushLog(`自然生长：${formatSheetChanges(growthChanges)}`);
  }
  const expectReward = settleExpect(state);

  if (state.yearIndex + 1 >= stageCount()) {
    state.exam = gradeExam(state);
    const verdict = judgeEnding(state);
    state.endingId = verdict.endingId;
    state.career = verdict.careerId;
    return { type: 'ending', endingId: state.endingId, exam: state.exam, driftChanges, expectReward };
  }

  state.yearIndex += 1;
  const next = getStage(state.yearIndex);
  state.household.money += next.allowance;
  state.actionsThisYear = [];
  state.plan = [];
  freshBoard(state);
  const gained = recoverEnergy(state.household);
  const energyText = gained > 0 ? `，精力回复 ${gained}` : '';
  const clouds = state.board.filter((key) => key === 'cloud').length;
  const cloudText = clouds > 0 ? `压力太大，脑洞里飘来 ${clouds} 朵乌云。` : '';
  state.pushLog(`进入${next.grade}，家里进账 ${next.allowance} 元${energyText}。${cloudText}`);
  state.pendingAspire = aspireQuestionFor(state);
  return { type: 'next', driftChanges, expectReward, ask: state.pendingAspire };
}
