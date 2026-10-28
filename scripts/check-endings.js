/**
 * 文件：scripts/check-endings.js
 * 作用：用几条固定玩法把一整局走完，确认四类结局都还能走到，再抽查几条规则。
 * 流程和玩家一样：每回合点脑洞 → 学技能 → （初中起）逛商店 → 排 3 个安排 → 结束本回合 → 回答志向。
 * 改了 skills、careers、stages、board、items、statuses 之后运行：npm run check
 */

import { ATTRIBUTES } from '../src/data/attributes.js';
import { buildBoard, BOARD_SIZE, CLOUD_MAX, INSIGHT_CELLS, cloudCount } from '../src/data/board.js';
import { bookForCareer } from '../src/data/books.js';
import { getCareerSkills, getSkillById, getSkillsForStage, isLearned } from '../src/data/skills.js';
import { totalRounds } from '../src/data/stages.js';
import GameState from '../src/core/GameState.js';
import { answerAspire } from '../src/systems/AspirationSystem.js';
import { canChoose } from '../src/systems/EventSystem.js';
import { checkMoodLines, hasStatus } from '../src/systems/MoodSystem.js';
import {
  buyBook, buyItem, commitPlan, digHole, learnSkill, planSkill, shopOpen,
} from '../src/systems/SheetSystem.js';
import { advance, endRound, resolveEventChoice } from '../src/systems/TimeSystem.js';

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
    .filter((cell) => cell.key !== 'cloud' && cell.key !== 'dug')
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

/** 温和玩法会在压力高时买玩具，满意度低时买相框。 */
function shop(state, plan) {
  if (!shopOpen(state)) return;
  if (plan.book) {
    const book = bookForCareer(plan.book);
    if (book && !state.books.includes(book.id)) buyBook(state, book.id);
  }
  if (!plan.gentle) return;
  if (state.child.stats.stress >= 55) buyItem(state, 'console');
  if (state.household.satisfaction <= 35) buyItem(state, 'frame');
}

function play(label, plan) {
  const state = GameState.createNew({ name: '测试', gender: plan.gender || 'boy' });
  state.seed = 12345;
  state.pendingIntro = false;
  let rounds = 0;
  const seen = new Set();
  while (!state.endingId && rounds < 40) {
    if (state.pendingAspire) {
      const ask = state.pendingAspire;
      answerAspire(state, ask, ask === 'direction' ? plan.direction : plan.career);
    }
    state.pendingIntro = false;
    if (plan.dig) digAll(state, plan.favorite || []);
    shop(state, plan);
    const pool = [
      ...(state.books.includes(bookForCareer(plan.book)?.id) ? getCareerSkills(plan.book) : []),
      ...getSkillsForStage(state.yearIndex),
    ];
    const wanted = pool.filter((skill) => plan.pick(skill, state));
    wanted.forEach((skill) => {
      if (!skill.auto && !isLearned(state, skill)) learnSkill(state, skill);
    });
    const ready = wanted.filter((skill) => isLearned(state, skill));
    for (let slot = 0; slot < 3 && ready.length > 0; slot += 1) {
      planSkill(state, ready[(slot + rounds) % ready.length]);
    }
    commitPlan(state);
    rounds += 1;
    const outcome = endRound(state);
    (outcome.notices || []).forEach((notice) => seen.add(notice.title));
    if (outcome.type === 'event') {
      resolveEventChoice(state, pickChoice(outcome.event, state, plan.gentle)).notices
        .forEach((notice) => seen.add(notice.title));
      advance(state);
    }
  }
  return { label, state, rounds, seen };
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

const gains = [];
const digger = GameState.createNew({ name: '测试', gender: 'girl' });
digger.household.energy = 999;
digger.household.energyMax = 999;
digger.board.forEach((key, index) => {
  if (!ATTRIBUTES.some((item) => item.key === key)) return;
  const result = digHole(digger, index);
  if (result.ok) gains.push(result.changes[key]);
});
report(
  gains.length > 0 && gains.every((value) => value >= 3 && value <= 5) && new Set(gains).size > 1,
  `脑洞属性格 ${gains.length} 次，每次 +${Math.min(...gains)}~${Math.max(...gains)}`,
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
      pick: (skill, state) => mainIn(skill, studyKeys) || (skill.energy >= 5 && state.child.stats.stress >= 40),
    }),
  },
  {
    expect: 'detour',
    run: play('嘴上说作家，天天在跑步', {
      dig: true,
      gender: 'girl',
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
    state.endingId === expect && run.rounds === totalRounds(),
    `${run.label} → ${state.endingId}${state.career ? `（${state.career}）` : ''} ${run.rounds} 回合 高考${state.exam?.score} `
      + `智${s.iq} 情${s.eq} 想${s.imagination} 记${s.memory} 体${s.physique} 魅${s.charm} 面${s.face} `
      + `| 心情${c.mood} 压力${c.stress} 满意${state.household.satisfaction} 钱${state.household.money} 书${state.books.length}`
      + ` 期望${state.expectDone.length} 提示[${[...run.seen].join('/')}]`,
  );
});

const parttime = getSkillById('parttime');
const job = GameState.createNew();
job.yearIndex = 3;
planSkill(job, parttime);
const before = job.household.money;
commitPlan(job);
report(job.household.money - before === 15, `打零工一次，积蓄 +${job.household.money - before}`);

const locked = GameState.createNew();
locked.household.money = 500;
const early = buyItem(locked, 'park');
locked.yearIndex = 2;
const first = buyItem(locked, 'park');
const twice = buyItem(locked, 'park');
report(!early.ok && first.ok && !twice.ok, `商店：婴儿期买不了，初中能买，同一回合同一样只能买一次`);

const mood = GameState.createNew();
mood.child.stats.stress = 100;
mood.household.satisfaction = 100;
const moneyBefore = mood.household.money;
checkMoodLines(mood);
const satReward = mood.household.money - moneyBefore;
mood.child.stats.stress = 0;
checkMoodLines(mood);
report(
  hasStatus(mood, 'overwhelmed') && hasStatus(mood, 'harmony') && hasStatus(mood, 'carefree')
    && satReward >= 30 && mood.household.satisfaction === 60,
  `压力满 → 心力交瘁；压力 0 → 无忧无虑；满意度满 → 家里和睦，积蓄 +${satReward}，满意度回到 ${mood.household.satisfaction}`,
);

if (failed > 0) {
  console.error(`有 ${failed} 项和预期不一致。`);
  process.exitCode = 1;
} else {
  console.log('全部检查通过。');
}
