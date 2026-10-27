/**
 * 文件：scripts/check-endings.js
 * 作用：用五条固定玩法走完四个时期，确认结局没有被改坏。
 * 改了 actions、events、stages 或 endings 之后运行：npm run check
 */

import { ATTRIBUTES } from '../src/data/attributes.js';
import { buildBoard, BOARD_SIZE, INSIGHT_CELLS } from '../src/data/board.js';
import { getAction, getActionsForStage } from '../src/data/actions.js';
import { getStage } from '../src/data/stages.js';
import GameState from '../src/core/GameState.js';
import { canPerform, performAction } from '../src/systems/ActionSystem.js';
import { canChoose } from '../src/systems/EventSystem.js';
import { beginYearEnd, resolveEventChoice, settleYear } from '../src/systems/TimeSystem.js';

function pickAction(state, ids) {
  const available = new Set(getActionsForStage(state.yearIndex).map((action) => action.id));
  for (const id of ids) {
    if (!available.has(id)) continue;
    const action = getAction(id);
    if (action && canPerform(state, action).ok) return action;
  }
  return getActionsForStage(state.yearIndex).find((action) => canPerform(state, action).ok) || null;
}

function pickChoice(event, state, gentle) {
  const ranked = event.choices.map((choice, index) => ({
    index,
    choice,
    score: (choice.effects?.stress ?? 0) - (choice.effects?.mood ?? 0),
  }));
  ranked.sort((a, b) => (gentle ? a.score - b.score : b.score - a.score));
  for (const item of ranked) {
    if (canChoose(state, item.choice)) return item.index;
  }
  return 0;
}

function play(label, plan, gentle) {
  const state = GameState.createNew();
  let guard = 0;
  while (!state.endingId && guard < 20) {
    guard += 1;
    const stageId = getStage(state.yearIndex).id;
    const pattern = plan[stageId] || [];
    let spins = 0;
    while (state.actionsThisYear.length < 2 && spins < 6) {
      spins += 1;
      const preferred = pattern[state.actionsThisYear.length % Math.max(pattern.length, 1)];
      const action = pickAction(state, [preferred]);
      if (!action) break;
      const result = performAction(state, action);
      if (!result.ok) break;
    }
    let outcome = beginYearEnd(state);
    if (outcome.type === 'event') {
      resolveEventChoice(state, pickChoice(outcome.event, state, gentle));
      outcome = settleYear(state);
    }
  }
  return {
    label,
    endingId: state.endingId,
    exam: state.exam?.score,
    stats: { ...state.child.stats },
    money: state.household.money,
    stuck: !state.endingId,
  };
}

const board = buildBoard(7, 0);
const counts = {};
board.forEach((key) => {
  counts[key] = (counts[key] || 0) + 1;
});
const uneven = ATTRIBUTES.some((item) => {
  const count = counts[item.key] || 0;
  return count < 9 || count > 10;
});
const insight = counts.insight || 0;
if (board.length !== BOARD_SIZE || uneven || insight !== INSIGHT_CELLS || insight >= 9) {
  console.error('脑洞图没有按 8×9 铺开，或悟性没有少一点。', counts);
  process.exitCode = 1;
} else {
  console.log(`OK 脑洞图 ${board.length} 格，悟性 ${insight}，属性 ${ATTRIBUTES.map((item) => counts[item.key]).join('/')}`);
}

const results = [
  play('学一点也休息', {
    baby: ['early-edu', 'soothe'],
    kinder: ['letters', 'nap'],
    middle: ['homework', 'rest'],
    high: ['drill', 'sleep'],
  }, true),
  play('多陪伴', {
    baby: ['early-edu', 'toy'],
    kinder: ['letters', 'park'],
    middle: ['outing', 'rest'],
    high: ['walk', 'sleep'],
  }, true),
  play('只往上推', {
    baby: ['baby-class', 'baby-class'],
    kinder: ['hobby', 'hobby'],
    middle: ['tutor', 'tutor'],
    high: ['cram', 'cram'],
  }, false),
  play('只顾休息', {
    baby: ['soothe', 'soothe'],
    kinder: ['nap', 'play'],
    middle: ['rest', 'rest'],
    high: ['sleep', 'sleep'],
  }, true),
];

const expect = {
  '学一点也休息': 'steady',
  '多陪伴': 'childhood',
  '只往上推': ['empty', 'burnout'],
  '只顾休息': 'unprepared',
};

let failed = 0;
results.forEach((result) => {
  const wanted = expect[result.label];
  const ok = Array.isArray(wanted) ? wanted.includes(result.endingId) : result.endingId === wanted;
  if (!ok || result.stuck) failed += 1;
  const mark = ok && !result.stuck ? 'OK' : 'FAIL';
  console.log(
    `${mark} ${result.label} → ${result.endingId} 考试${result.exam} `
    + `学识${result.stats.study} 体质${result.stats.body} 心情${result.stats.mood} 压力${result.stats.stress} 钱${result.money}`,
  );
});

if (failed > 0) {
  console.error(`有 ${failed} 条路径和预期结局不一致。`);
  process.exitCode = 1;
} else {
  console.log('四条路径都走到了预期结局。');
}
