/**
 * 文件：scripts/check-endings.js
 * 作用：用几条固定玩法把一整局走完，确认四类结局都还能走到，再抽查几条规则。
 * 流程和玩家一样：每回合点脑洞 → 学技能 → （小学起）逛商店 → （初中起）找同桌 / 买职业书 → 排 3 个安排 → 结束本回合 → 小故事 / 抉择 → 回答志向。
 * 改了 skills、careers、stages、board、items、statuses、events 之后运行：npm run check
 * 一局 24 回合（婴儿 3、幼儿园 4、小学 5、初中 5、高中 7）。
 */

import { BOARD_ATTRIBUTES } from '../src/data/attributes.js';
import { BOARD_COLS, DIGS_PER_ROUND, ENERGY_BY_STAGE, HOLE_ENERGY_COST } from '../src/config/constants.js';
import { BOARD_SIZE, BRAIN_SKIP_MAX, VISION_START, buildBoard, isRevealed, visionOrigin } from '../src/data/board.js';
import { CAREERS, careerTier, getCareer } from '../src/data/careers.js';
import { bookForCareer } from '../src/data/books.js';
import { getCareerSkills, getSkillById, getSkillsForStage, isLearned, mainEffect } from '../src/data/skills.js';
import { totalRounds } from '../src/data/stages.js';
import GameState from '../src/core/GameState.js';
import { answerAspire } from '../src/systems/AspirationSystem.js';
import { canChoose, getEventById } from '../src/systems/EventSystem.js';
import { checkMoodLines, hasStatus } from '../src/systems/MoodSystem.js';
import { pickEvent } from '../src/systems/EventSystem.js';
import { actWithFriend, friendOpen, unlockFriend } from '../src/systems/FriendSystem.js';
import {
  bookOpen, buyBook, buyItem, commitPlan, digHole, learnSkill, planSkill, recoverEnergy, shopOpen, skipBrainPage,
} from '../src/systems/SheetSystem.js';
import { resolveStory } from '../src/systems/StorySystem.js';
import { endingStory } from '../src/systems/EndingSystem.js';
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
    .filter((cell) => cell.key !== 'dug')
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
  if (plan.book && bookOpen(state)) {
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
    if (friendOpen(state) && plan.gentle && !state.friend.actedThisRound) {
      actWithFriend(state, plan.dig ? 'homework' : 'walk');
    }
    const pool = [
      ...(state.books.includes(bookForCareer(plan.book)?.id) ? getCareerSkills(plan.book) : []),
      ...getSkillsForStage(state.yearIndex, state),
    ];
    const wanted = pool.filter((skill) => plan.pick(skill, state));
    for (let pass = 0; pass < 6; pass += 1) {
      let grew = false;
      wanted.forEach((skill) => {
        if (skill.auto || isLearned(state, skill)) return;
        if (learnSkill(state, skill).ok) grew = true;
      });
      if (!grew) break;
    }
    const ready = wanted.filter((skill) => isLearned(state, skill));
    for (let slot = 0; slot < 3 && ready.length > 0; slot += 1) {
      planSkill(state, ready[(slot + rounds) % ready.length]);
    }
    commitPlan(state);
    rounds += 1;
    const outcome = endRound(state);
    (outcome.notices || []).forEach((notice) => seen.add(notice.title));
    if (outcome.type === 'story' || outcome.type === 'event') {
      let guard = 0;
      while (state.pendingStoryId && guard < 16) {
        resolveStory(state).notices.forEach((notice) => seen.add(notice.title));
        guard += 1;
      }
      const choiceId = state.pendingChoiceId || state.pendingEventId;
      if (choiceId) {
        const event = getEventById(choiceId);
        if (event) {
          resolveEventChoice(state, pickChoice(event, state, plan.gentle)).notices
            .forEach((notice) => seen.add(notice.title));
        }
      }
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
const tileCounts = [...BOARD_ATTRIBUTES.map((item) => item.key), 'insight'].map((key) => counts[key] || 0);
const uneven = tileCounts.some((count) => count < 16 || count > 17)
  || Math.max(...tileCounts) - Math.min(...tileCounts) > 1;
report(
  board.length === BOARD_SIZE && BOARD_SIZE === 100 && !uneven && !counts.cloud
    && !counts.charm && !counts.face,
  `脑洞图 ${board.length} 格，悟性 ${counts.insight}，属性 ${BOARD_ATTRIBUTES.map((item) => counts[item.key]).join('/')}，与悟性均分，无面子魅力乌云`,
);
report(
  ENERGY_BY_STAGE.join('/') === '60/75/90/120/160',
  `精力上限 婴儿/幼儿园/小学/初中/高中 = ${ENERGY_BY_STAGE.join('/')}`,
);
const rest = GameState.createNew({ name: '测试', gender: 'boy' });
rest.household.energy = 0;
const fromEmpty = recoverEnergy(rest);
rest.household.energy = 10;
const fromTen = recoverEnergy(rest);
report(
  fromEmpty === 42 && rest.household.energy === 52 && fromTen === 42,
  `回复按时期总精力 70%：空槽 +42，剩 10 再 +42 → ${rest.household.energy}，不是按剩余精力算`,
);

const gains = [];
let extraKeys = false;
const digger = GameState.createNew({ name: '测试', gender: 'girl' });
digger.household.energy = DIGS_PER_ROUND * HOLE_ENERGY_COST;
digger.household.energyMax = 999;
digger.board.forEach((key, index) => {
  if (!BOARD_ATTRIBUTES.some((item) => item.key === key)) return;
  const result = digHole(digger, index);
  if (!result.ok) return;
  gains.push(result.changes[key]);
  if (Object.keys(result.changes).some((item) => item !== key)) extraKeys = true;
});
const seventh = digHole(digger, digger.board.findIndex((key, index) => !digger.dug.includes(index)));
report(
  gains.length === DIGS_PER_ROUND && !extraKeys && gains.every((value) => value >= 3 && value <= 5)
    && new Set(gains).size > 1 && !seventh.ok,
  `脑洞属性格精力用完才停：${gains.length} 次只加本项 +${Math.min(...gains)}~${Math.max(...gains)}，没精力挖不了`,
);
const flipped = buildBoard(9, 2, { flip: true }).filter((key) => key === 'flip').length;
report(flipped === 1, `下一页格会作为 1 格出现在脑洞图上`);

const wise = GameState.createNew({ name: '测试', gender: 'boy' });
wise.household.insight = 30;
wise.household.energy = 999;
wise.dug = [];
const insightCell = wise.board.findIndex((key) => key === 'insight');
const over = insightCell >= 0 ? digHole(wise, insightCell) : { ok: false };
report(
  over.ok && wise.household.insight === 35 && over.changes.insight === 5,
  `悟性无上限：30 再挖一格悟性 → ${wise.household.insight}`,
);

const fog = GameState.createNew({ name: '测试', gender: 'girl' });
const origin = visionOrigin();
const startLit = fog.board.filter((_, index) => isRevealed(fog, index)).length;
const corner = fog.board.findIndex((key, index) => isRevealed(fog, index) && key !== 'flip');
fog.household.energy = 999;
const litDig = digHole(fog, corner);
const afterLit = fog.board.filter((_, index) => isRevealed(fog, index)).length;
report(
  startLit === VISION_START * VISION_START && origin.col === 3 && origin.row === 3
    && litDig.ok && afterLit === 21,
  `脑洞视野：开局中间 ${VISION_START}×${VISION_START}（${startLit} 格），点开后扩 3×3（${afterLit} 格）`,
);

fog.brainHasSkip = true;
fog.brainFlips = 0;
const usedBefore = fog.digsThisRound;
const skip1 = skipBrainPage(fog);
const skipReset = fog.dug.length === 0 && fog.digsThisRound === usedBefore;
fog.brainHasSkip = true;
const skip2 = skipBrainPage(fog);
fog.brainHasSkip = true;
const skip3 = skipBrainPage(fog);
report(
  skip1.ok && skipReset && skip2.ok && !skip3.ok && fog.brainFlips === BRAIN_SKIP_MAX,
  `下一页脑洞最多 ${BRAIN_SKIP_MAX} 次，翻页后格子重亮、本回合次数还在`,
);

const sci = getCareer('scientist');
report(
  CAREERS.every((career) => career.stories?.barely && career.stories?.solid && career.stories?.peak)
    && careerTier(sci, { iq: 150, memory: 120 }) === 'barely'
    && careerTier(sci, { iq: 190, memory: 165 }) === 'peak',
  '八个职业都有擦线/够格/远超三档故事',
);
const drifted = GameState.createNew({ name: '测试', gender: 'girl' });
drifted.endingId = 'drift';
report(
  endingStory(drifted).includes('离') && endingStory(drifted).includes('最近'),
  '还没想好的结局会点出最接近的职业',
);

const studyKeys = new Set(['iq', 'memory']);
const mainIn = (skill, keys) => {
  const main = mainEffect(skill);
  return Boolean(main && keys.has(main.key));
};

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
job.yearIndex = 4;
planSkill(job, parttime);
const before = job.household.money;
commitPlan(job);
report(job.household.money - before === (parttime.money || 0), `打零工一次，积蓄 +${job.household.money - before}`);

const locked = GameState.createNew();
locked.household.money = 500;
const early = buyItem(locked, 'park');
locked.yearIndex = 2;
const first = buyItem(locked, 'park');
const twice = buyItem(locked, 'park');
report(!early.ok && first.ok && !twice.ok, `商店：婴儿期买不了，小学能买，同一回合同一样只能买一次`);

const bookGate = GameState.createNew();
bookGate.household.money = 500;
bookGate.yearIndex = 2;
const bookEarly = buyBook(bookGate, 'book-teacher');
bookGate.yearIndex = 3;
const bookOk = buyBook(bookGate, 'book-teacher');
report(!bookEarly.ok && bookOk.ok, `职业书：小学买不了，初中能买`);

const pal = GameState.createNew();
const palEarly = actWithFriend(pal, 'walk');
pal.yearIndex = 3;
unlockFriend(pal);
const palOk = actWithFriend(pal, 'walk');
const palTwice = actWithFriend(pal, 'homework');
report(!palEarly.ok && palOk.ok && !palTwice.ok && pal.friend.closeness >= 8, `朋友：小学找不到，初中能找一次`);

const babyDay = GameState.createNew({ name: '测试', gender: 'boy' });
babyDay.justPlayed = [];
const must = pickEvent(babyDay);
report(Boolean(must), `结束回合必有事件：${must ? must.id : '无'}`);

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
