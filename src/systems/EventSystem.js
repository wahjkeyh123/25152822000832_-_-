/**
 * 文件：src/systems/EventSystem.js
 * 作用：从抉择表里挑一件，挂到「当前期望」右边的铃上。选项上不写加减。
 * 已经选过的一次性事件不会再出。如果上次关掉网页时卡在选项上，优先把那一件请回来。
 *
 * 挑的顺序：
 * 1. 绑定了这一回合的大事（第一次考试、高考前一晚）。
 * 2. 还没出过的当期事件，按这一回合安排过什么加权。
 * 3. 当期的兜底事件，保证每一回合都能弹出一页。
 */

import { EVENTS, getEventById } from '../data/events.js';
import { closenessOf } from '../data/friends.js';
import { getSkillById } from '../data/skills.js';
import { mulberry32 } from '../utils/rng.js';

export function canChoose(state, choice) {
  const spend = choice.money < 0 ? -choice.money : 0;
  return state.household.money >= spend;
}

/** 选项的口气：护着、催着、还是折中。没写 tone 时从效果里猜。 */
export function choiceTone(choice) {
  if (choice.tone) return choice.tone;
  const effects = choice.effects || {};
  const mood = effects.mood || 0;
  const stress = effects.stress || 0;
  const study = effects.study || 0;
  const sat = choice.sat || 0;
  if (mood >= 4 && stress <= 0) return 'gentle';
  if (sat < 0 && mood > 0) return 'gentle';
  if (study >= 4 || (sat >= 7 && stress > 0)) return 'strict';
  return 'practical';
}

/** 这个口气放在当前的压力和满意度里，算不算对劲。 */
export function choiceFits(state, tone) {
  const stress = state.child.stats.stress;
  const sat = state.household.satisfaction;
  if (tone === 'gentle') return stress >= 48 || sat >= 60;
  if (tone === 'strict') return sat <= 50 || stress <= 45;
  return true;
}

/**
 * 选项上不写加减。真正结算时看这步合不合适：
 * 对劲就按原效果；拧着来，好处打折、压力更重。
 */
export function resolveChoiceOutcome(state, choice) {
  const tone = choiceTone(choice);
  const reasonable = choiceFits(state, tone);
  const effects = { ...(choice.effects || {}) };
  let sat = choice.sat || 0;
  let friend = choice.friend || 0;
  const money = choice.money || 0;
  if (!reasonable) {
    Object.keys(effects).forEach((key) => {
      if (effects[key] > 0) effects[key] = Math.max(1, Math.round(effects[key] * 0.45));
      else if (effects[key] < 0) effects[key] = Math.round(effects[key] * 1.4);
    });
    if ((effects.stress || 0) >= 0) effects.stress = (effects.stress || 0) + 4;
    if (sat > 0) sat = Math.max(1, Math.floor(sat * 0.4));
    else sat -= 2;
    if (friend > 0) friend = Math.max(1, Math.floor(friend * 0.5));
  } else {
    Object.keys(effects).forEach((key) => {
      if (effects[key] > 0) effects[key] = Math.round(effects[key] * 1.15) || effects[key];
    });
  }
  return { effects, sat, friend, money, reasonable, tone };
}

export function choiceNotice(state, outcome) {
  const name = state.child.name;
  if (outcome.reasonable) {
    if (outcome.tone === 'gentle') return { title: '这一下松了松', text: `压力正需要缓一缓，${name}明显松了一口气。`, kind: 'good' };
    if (outcome.tone === 'strict') return { title: '这一下踩在点上', text: '家里这阵子正需要往前推一推，你没选错方向。', kind: 'good' };
    return { title: '还算稳妥', text: '不算出格，家里把这一页翻过去了。', kind: 'info' };
  }
  if (outcome.tone === 'gentle') {
    return { title: '有点惯着了', text: '父母这边还绷着，光顺着来，家里不太买账。', kind: 'bad' };
  }
  if (outcome.tone === 'strict') {
    return { title: '拧着来了', text: `${name}已经绷着，再催，心里更紧。`, kind: 'bad' };
  }
  return { title: '有点别扭', text: '这一步和眼下的气氛不太合。', kind: 'bad' };
}

/** 小故事之后，有时在期望右边挂一件抉择。大事（绑了回合的）必挂。 */
export function queueChoice(state) {
  if (state.pendingEventId) return null;
  const event = pickEvent(state);
  if (!event) return null;
  const scripted = event.round != null || (event.priority || 0) >= 18;
  if (state.pendingChoiceId && !scripted) return null;
  const roll = mulberry32(state.seed + state.roundSerial * 53 + 7)();
  if (scripted || roll < 0.7) {
    state.pendingChoiceId = event.id;
    return event;
  }
  return null;
}

export function pickEvent(state) {
  if (state.pendingEventId) {
    return getEventById(state.pendingEventId);
  }

  const tagged = planTags(state);
  const candidates = EVENTS.filter((event) => eligible(event, state));
  if (candidates.length === 0) return null;

  const scripted = candidates
    .filter((event) => event.round != null || (event.priority || 0) >= 18)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  if (scripted.length > 0) return scripted[0];

  const fresh = candidates.filter((event) => event.once !== false);
  const pool = fresh.length > 0 ? fresh : candidates;
  return pickWeighted(pool, state, tagged);
}

function eligible(event, state) {
  if (event.stage != null && event.stage !== state.yearIndex) return false;
  if (event.round != null && event.round !== state.round) return false;
  if (event.needFriend && !state.friend?.unlocked) return false;
  if (event.once !== false && state.seenEvents.includes(event.id)) return false;
  if (event.when && !event.when(state)) return false;
  return true;
}

/** 某一格安排对应的标签，用来抽跟它相近的小故事。 */
export function tagsForAction(id) {
  const tags = new Set();
  const skill = getSkillById(id);
  if (!skill) {
    tags.add('empty');
    return tags;
  }
  if ((skill.core?.study || 0) >= 3) tags.add('study');
  if ((skill.core?.body || 0) >= 2) tags.add('body');
  if ((skill.energy || 0) >= 5 || (skill.core?.mood || 0) >= 2) tags.add('play');
  if ((skill.core?.stress || 0) >= 2) tags.add('push');
  if (tags.size === 0) tags.add('empty');
  return tags;
}

/** 这一回合刚执行过的安排，换成 study / body / play / push / empty，给事件加权。 */
export function planTags(state) {
  const tags = new Set();
  const ids = state.justPlayed || [];
  if (ids.length === 0) {
    tags.add('empty');
    return tags;
  }
  ids.forEach((id) => tagsForAction(id).forEach((tag) => tags.add(tag)));
  return tags;
}

function pickWeighted(pool, state, tagged) {
  const scored = pool.map((event) => ({
    event,
    weight: Math.max(1, eventWeight(event, state, tagged)),
  }));
  const total = scored.reduce((sum, item) => sum + item.weight, 0);
  let roll = mulberry32(state.seed + state.roundSerial * 97 + 13)() * total;
  for (const item of scored) {
    roll -= item.weight;
    if (roll <= 0) return item.event;
  }
  return scored[scored.length - 1].event;
}

function eventWeight(event, state, tagged) {
  let weight = 3;
  const tags = event.tags || [];
  if (tags.some((tag) => tagged.has(tag))) weight += 8;
  if (tags.includes('stress') && state.child.stats.stress >= 60) weight += 6;
  if (tags.includes('friend')) {
    const palId = event.pal || state.friend?.lastId;
    if (closenessOf(state, palId) >= 40) weight += 4;
    if (state.friend?.actedThisRound && (!event.pal || event.pal === state.friend.lastId)) weight += 6;
  }
  if (tags.includes('empty') && tagged.has('empty')) weight += 10;
  if (event.once === false) weight += 1;
  return weight;
}

export { getEventById };
