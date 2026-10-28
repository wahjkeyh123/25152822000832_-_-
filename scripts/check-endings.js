/**
 * 文件：scripts/check-endings.js
 * 作用：用几条固定玩法把新流程走完，确认四类结局都还能走到。
 * 流程和玩家一样：点脑洞拿悟性 → 学技能 → 买书 → 排 5 个安排 → 结束时期 → 回答志向。
 * 改了 skills、careers、stages、board 之后运行：npm run check
 */

import { ATTRIBUTES } from '../src/data/attributes.js';
import { buildBoard, BOARD_SIZE, CLOUD_MAX, INSIGHT_CELLS, cloudCount } from '../src/data/board.js';
import { bookForCareer } from '../src/data/books.js';
import { getCareerSkills, getSkillById, getSkillsForStage, isLearned } from '../src/data/skills.js';
import GameState from '../src/core/GameState.js';
import { answerAspire } from '../src/systems/AspirationSystem.js';
import { canChoose } from '../src/systems/EventSystem.js';
import { buyBook, commitPlan, digHole, learnSkill, planSkill } from '../src/systems/SheetSystem.js';
import { beginYearEnd, resolveEventChoice, settleYear } from '../src/systems/TimeSystem.js';

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

/** 先点悟性格，再点想要的属性格，精力点完为止。 */
function digAll(state, favorite) {
  const order = state.board
    .map((key, index) => ({ key, index }))
    .filter((cell) => cell.key !== 'cloud')
    .sort((a, b) => rank(a.key) - rank(b.key));
  function rank(key) {
    if (key === 'insight') return 0;
    const at = favorite.indexOf(key);
    return at >= 0 ? 1 + at : 20;
  }
  for (const cell of order) {
    if (!digHole(state, cell.index).ok) break;
  }
}

function play(label, plan) {
  const state = GameState.createNew();
  state.seed = 12345;
  let guard = 0;
  while (!state.endingId && guard < 10) {
    guard += 1;
    if (plan.dig) digAll(state, plan.favorite || []);
    if (plan.book && state.yearIndex >= 1) {
      const book = bookForCareer(plan.book);
      if (book && !state.books.includes(book.id)) buyBook(state, book.id);
    }
    const pool = [
      ...(state.books.includes(bookForCareer(plan.book)?.id) ? getCareerSkills(plan.book) : []),
      ...getSkillsForStage(state.yearIndex),
    ];
    const wanted = pool.filter((skill) => plan.pick(skill));
    wanted.forEach((skill) => {
      if (!skill.auto) learnSkill(state, skill);
    });
    const ready = wanted.filter((skill) => isLearned(state, skill));
    for (let slot = 0; slot < 5 && ready.length > 0; slot += 1) {
      planSkill(state, ready[slot % ready.length]);
    }
    commitPlan(state);
    let outcome = beginYearEnd(state);
    if (outcome.type === 'event') {
      resolveEventChoice(state, pickChoice(outcome.event, state, plan.gentle));
      outcome = settleYear(state);
    }
    if (outcome.ask) {
      const answer = outcome.ask === 'direction' ? plan.direction : plan.career;
      answerAspire(state, outcome.ask, answer);
    }
  }
  return { label, state };
}

let failed = 0;
function report(ok, line) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'OK' : 'FAIL'} ${line}`);
}

const board = buildBoard(7, 0, 0);
const counts = {};
board.forEach((key) => {
  counts[key] = (counts[key] || 0) + 1;
});
const uneven = ATTRIBUTES.some((item) => (counts[item.key] || 0) < 9 || (counts[item.key] || 0) > 10);
report(
  board.length === BOARD_SIZE && !uneven && counts.insight === INSIGHT_CELLS && !counts.cloud,
  `脑洞图 ${board.length} 格，悟性 ${counts.insight}，属性 ${ATTRIBUTES.map((item) => counts[item.key]).join('/')}`,
);
const stormy = buildBoard(7, 3, 95).filter((key) => key === 'cloud').length;
report(
  cloudCount(59) === 0 && cloudCount(60) === 1 && stormy === 8 && cloudCount(200) === CLOUD_MAX,
  `乌云：压力59 → 0 格，压力60 → 1 格，压力95 → ${stormy} 格，上限 ${CLOUD_MAX} 格`,
);

const studyKeys = new Set(['iq', 'memory']);
const mainIn = (skill, keys) => Object.keys(skill.effects || {}).some((key) => keys.has(key));

const runs = [
  {
    expect: 'dream',
    run: play('想当科学家，也按时放松', {
      dig: true,
      favorite: ['iq', 'memory'],
      book: 'scientist',
      direction: 'science',
      career: 'scientist',
      gentle: true,
      pick: (skill) => mainIn(skill, studyKeys) || skill.energy >= 10,
    }),
  },
  {
    expect: 'detour',
    run: play('嘴上说作家，天天在跑步', {
      dig: true,
      favorite: ['physique', 'charm'],
      book: 'athlete',
      direction: 'arts',
      career: 'writer',
      gentle: true,
      pick: (skill) => mainIn(skill, new Set(['physique', 'charm'])),
    }),
  },
  {
    expect: 'burnout',
    run: play('只往上推', {
      dig: true,
      favorite: ['iq'],
      book: 'scientist',
      direction: 'science',
      career: 'scientist',
      gentle: false,
      pick: (skill) => (skill.core?.stress ?? 0) >= 2,
    }),
  },
  {
    expect: 'drift',
    run: play('什么都不安排', {
      dig: false,
      direction: 'people',
      career: 'teacher',
      gentle: true,
      pick: () => false,
    }),
  },
];

runs.forEach(({ expect, run }) => {
  const { state } = run;
  const s = state.child.sheet;
  const c = state.child.stats;
  report(
    state.endingId === expect,
    `${run.label} → ${state.endingId}${state.career ? `（${state.career}）` : ''} 高考${state.exam?.score} `
      + `智${s.iq} 情${s.eq} 想${s.imagination} 记${s.memory} 体${s.physique} 魅${s.charm} 面${s.face} `
      + `| 学识${c.study} 心情${c.mood} 压力${c.stress} 钱${state.household.money} 书${state.books.length}`,
  );
});

const parttime = getSkillById('parttime');
const job = GameState.createNew();
job.yearIndex = 3;
planSkill(job, parttime);
const before = job.household.money;
commitPlan(job);
report(job.household.money - before === 15, `打零工一次，积蓄 +${job.household.money - before}`);

if (failed > 0) {
  console.error(`有 ${failed} 项和预期不一致。`);
  process.exitCode = 1;
} else {
  console.log('全部检查通过。');
}
