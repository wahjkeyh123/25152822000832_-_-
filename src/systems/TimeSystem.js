/**
 * 文件：src/systems/TimeSystem.js
 * 作用：推进回合和时期。这是整局游戏的时钟。
 *
 * 一个回合怎么结束（顺序不要随便调）：
 * 1. 执行安排（GameScene 先调 commitPlan）。
 * 2. 孩子自己的变化：压力慢慢涨、父母满意度慢慢掉、七项属性自然生长、状态生效一次。
 * 3. 检查压力和满意度有没有到头（MoodSystem）。
 * 4. 弹出一串小故事：安排几格就有几页，再随机多 1～2 件。压力高、满意度低时更容易往坏的一边偏。
 * 5. 有时在「当前期望」右边挂一件抉择，要点开才选。选项上不写加减。
 * 6. 还没到这个时期的最后一回合：进入下一回合，精力回复，脑洞重排。
 * 7. 最后一回合：检查「当前期望」。高中就去高考；否则进入下一个时期，发生活费，
 *    初中和高中开头还要问一次「你更想成为什么」。
 */

import { getStage, stageCount } from '../data/stages.js';
import { aspireQuestionFor } from './AspirationSystem.js';
import { gradeExam } from './ExamSystem.js';
import { judgeEnding } from './EndingSystem.js';
import { settleExpect } from './ExpectSystem.js';
import { choiceNotice, getEventById, queueChoice, resolveChoiceOutcome } from './EventSystem.js';
import { pickStoryQueue } from './StorySystem.js';
import { changeCloseness, unlockFriend } from './FriendSystem.js';
import { changeSatisfaction, checkMoodLines, tickStatuses } from './MoodSystem.js';
import { applyGrowth, applySheet, formatSheetChanges, freshBoard, recoverEnergy, syncSheet } from './SheetSystem.js';
import { applyEffects } from './StatSystem.js';

/** 结束当前回合。返回 { type: 'round' | 'story' | 'event' | 'next' | 'ending', notices, ... }。 */
export function endRound(state) {
  const settled = settleRound(state);
  queueChoice(state);
  const stories = pickStoryQueue(state);
  if (stories.length > 0) {
    state.pendingStories = stories.map((item) => item.id);
    state.pendingStoryIndex = 0;
    state.pendingStoryId = stories[0].id;
    return { type: 'story', story: stories[0], total: stories.length, ...settled };
  }
  if (state.pendingEventId) {
    const event = getEventById(state.pendingEventId);
    if (event) return { type: 'event', event, ...settled };
    state.pendingEventId = null;
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

/** 抉择选完。旧存档若还卡在 pendingEventId 上，也走这里。不推进回合。 */
export function resolveEventChoice(state, choiceIndex) {
  const eventId = state.pendingChoiceId || state.pendingEventId;
  const event = getEventById(eventId);
  if (!event) return { changes: {}, choice: null, notices: [] };
  const choice = event.choices[choiceIndex];
  if (!choice) return { changes: {}, choice: null, notices: [] };

  const outcome = resolveChoiceOutcome(state, choice);
  if (outcome.money) {
    state.household.money = Math.max(0, state.household.money + outcome.money);
  }
  const coreChanges = applyEffects(state.child.stats, outcome.effects);
  const changes = syncSheet(state.child, outcome.effects);
  if (choice.sheet) {
    const extra = applySheet(state.child.sheet, choice.sheet);
    Object.entries(extra).forEach(([key, value]) => {
      changes[key] = (changes[key] || 0) + value;
    });
  }
  if (coreChanges.stress) changes.stress = coreChanges.stress;
  if (outcome.money) changes.money = outcome.money;
  if (outcome.sat) changes.satisfaction = changeSatisfaction(state, outcome.sat);
  if (outcome.friend) {
    changes.closeness = changeCloseness(state, outcome.friend, event.pal || state.friend?.lastId);
  }
  state.seenEvents.push(event.id);
  state.pendingChoiceId = null;
  state.pendingEventId = null;
  state.pushLog(`${event.title}：${choice.text}`);
  const notices = checkMoodLines(state);
  notices.unshift(choiceNotice(state, outcome));
  return { changes, choice, outcome, notices };
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

/** 新回合开始：清掉安排和本回合买过的道具，精力回复，重排脑洞。 */
function startRound(state) {
  state.actionsThisYear = [];
  state.plan = [];
  state.itemsThisRound = [];
  state.justPlayed = [];
  if (state.friend) state.friend.actedThisRound = false;
  unlockFriend(state);
  freshBoard(state);
  const gained = recoverEnergy(state);
  const parts = [`第 ${state.round} 回合开始`];
  if (gained > 0) parts.push(`精力回复 ${gained}`);
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
