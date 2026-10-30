/**
 * 文件：src/core/GameState.js
 * 作用：这一局的全部进度。存档就是把它变成普通对象放进浏览器。
 * 场景可以读它、通过系统函数改它，不要在界面文件里直接写属性公式。
 *
 * 时间怎么记：yearIndex 是第几个时期（0 婴儿 … 4 高中），round 是这个时期里的第几回合（从 1 开始），
 * roundSerial 是整局已经过了几个回合，用来给脑洞和奖励当随机种子。
 */

import { SAVE_VERSION, energyMaxFor } from '../config/constants.js';
import { BRAIN_SKIP_CHANCE, BOARD_SIZE, buildBoard } from '../data/board.js';
import { mulberry32 } from '../utils/rng.js';
import Child from '../models/Child.js';
import Household from '../models/Household.js';
import { normalizeFriend } from '../data/friends.js';
import { fillName } from '../utils/text.js';

const FIRST_LOG = '{name}出生了。先在右边学技能，再到「安排」里排进本回合。';

export default class GameState {
  constructor(raw = {}) {
    this.version = SAVE_VERSION;
    this.seed = raw.seed ?? (Date.now() % 1000000);
    this.yearIndex = raw.yearIndex ?? 0;
    this.round = raw.round ?? 1;
    this.roundSerial = raw.roundSerial ?? 0;
    this.child = raw.child instanceof Child ? raw.child : new Child(raw.child);
    this.household = raw.household instanceof Household ? raw.household : new Household(raw.household);
    const energyCap = energyMaxFor(this.yearIndex);
    if (this.household.energyMax !== energyCap) {
      if (this.household.energy >= (this.household.energyMax || 0)) this.household.energy = energyCap;
      this.household.energyMax = energyCap;
    }
    if (this.household.energy > energyCap) this.household.energy = energyCap;
    this.log = Array.isArray(raw.log) ? [...raw.log] : [fillName(FIRST_LOG, this.child)];
    this.seenEvents = Array.isArray(raw.seenEvents) ? [...raw.seenEvents] : [];
    this.seenStories = Array.isArray(raw.seenStories) ? [...raw.seenStories] : [];
    this.pendingEventId = raw.pendingEventId ?? null;
    this.pendingStoryId = raw.pendingStoryId ?? null;
    this.pendingStories = Array.isArray(raw.pendingStories) ? [...raw.pendingStories] : [];
    this.pendingStoryIndex = raw.pendingStoryIndex ?? 0;
    this.pendingChoiceId = raw.pendingChoiceId ?? null;
    /** 这一回合刚执行过的技能 id，给事件加权用。 */
    this.justPlayed = Array.isArray(raw.justPlayed) ? [...raw.justPlayed] : [];
    /** 初中起的同学会。unlocked 为 false 时面板打不开。 */
    this.friend = normalizeFriend(raw.friend);
    this.actionsThisYear = Array.isArray(raw.actionsThisYear) ? [...raw.actionsThisYear] : [];
    this.plan = Array.isArray(raw.plan) ? [...raw.plan] : [];
    /** 上一回合排过的技能，「照上回合排」用它。 */
    this.lastPlan = Array.isArray(raw.lastPlan) ? [...raw.lastPlan] : [];
    this.learnedSkills = Array.isArray(raw.learnedSkills) ? [...raw.learnedSkills] : [];
    /** 买过的职业书 id。 */
    this.books = Array.isArray(raw.books) ? [...raw.books] : [];
    /** 这一回合已经买过的道具，每个道具每回合限一次。 */
    this.itemsThisRound = Array.isArray(raw.itemsThisRound) ? [...raw.itemsThisRound] : [];
    /** 身上的状态：[{ id, rounds }]。定义在 data/statuses.js。 */
    this.statuses = Array.isArray(raw.statuses) ? raw.statuses.map((item) => ({ ...item })) : [];
    /** 初中选的方向、高中选的职业。没选时是 null。 */
    this.aspiration = { direction: null, career: null, ...(raw.aspiration || {}) };
    /** 进入初中或高中时还没回答的志向问题：'direction' 或 'career'。 */
    this.pendingAspire = raw.pendingAspire ?? null;
    /** 换期过场还没看过时为 true。读档回来也会补放一次。 */
    this.pendingIntro = raw.pendingIntro ?? false;
    /** 已经完成的「当前期望」，记的是时期 id。 */
    this.expectDone = Array.isArray(raw.expectDone) ? [...raw.expectDone] : [];
    /** 点左下角领过额外奖励的时期 id。 */
    this.expectBonusClaimed = Array.isArray(raw.expectBonusClaimed) ? [...raw.expectBonusClaimed] : [];
    this.brainFlips = raw.brainFlips ?? 0;
    this.brainHasSkip = raw.brainHasSkip ?? mulberry32((this.seed + this.roundSerial * 17 + 3) >>> 0)() < BRAIN_SKIP_CHANCE;
    const savedBoard = Array.isArray(raw.board) && raw.board.length === BOARD_SIZE ? raw.board : null;
    this.board = savedBoard
      ? [...savedBoard]
      : buildBoard(this.seed, this.roundSerial, { flip: this.brainHasSkip && this.brainFlips < 2 });
    this.dug = savedBoard && Array.isArray(raw.dug) ? [...raw.dug] : [];
    this.digsThisRound = raw.digsThisRound ?? this.dug.length;
    this.exam = raw.exam ?? null;
    this.endingId = raw.endingId ?? null;
    /** 结局落在哪个职业上。没有够格的职业时是 null。 */
    this.career = raw.career ?? null;
  }

  /** 新开一局。name 和 gender 来自开局的取名页。 */
  static createNew({ name, gender } = {}) {
    return new GameState({
      seed: Date.now() % 1000000,
      child: { name, gender },
      pendingIntro: true,
    });
  }

  static fromJSON(raw) {
    return new GameState(raw);
  }

  toJSON() {
    return {
      version: this.version,
      seed: this.seed,
      yearIndex: this.yearIndex,
      round: this.round,
      roundSerial: this.roundSerial,
      child: this.child.toJSON(),
      household: this.household.toJSON(),
      log: this.log,
      seenEvents: this.seenEvents,
      seenStories: this.seenStories,
      pendingEventId: this.pendingEventId,
      pendingStoryId: this.pendingStoryId,
      pendingStories: this.pendingStories,
      pendingStoryIndex: this.pendingStoryIndex,
      pendingChoiceId: this.pendingChoiceId,
      justPlayed: this.justPlayed,
      friend: this.friend,
      actionsThisYear: this.actionsThisYear,
      plan: this.plan,
      lastPlan: this.lastPlan,
      learnedSkills: this.learnedSkills,
      books: this.books,
      itemsThisRound: this.itemsThisRound,
      statuses: this.statuses,
      aspiration: this.aspiration,
      pendingAspire: this.pendingAspire,
      pendingIntro: this.pendingIntro,
      expectDone: this.expectDone,
      expectBonusClaimed: this.expectBonusClaimed,
      dug: this.dug,
      digsThisRound: this.digsThisRound,
      brainFlips: this.brainFlips,
      brainHasSkip: this.brainHasSkip,
      board: this.board,
      exam: this.exam,
      endingId: this.endingId,
      career: this.career,
    };
  }

  /** 最新的一句放在最前面，只留 5 句。文案里的 {name}、{ta} 在这里换成孩子的名字和他 / 她。 */
  pushLog(line) {
    this.log.unshift(fillName(line, this.child, { friend: this.friend?.name }));
    this.log = this.log.slice(0, 5);
  }
}
