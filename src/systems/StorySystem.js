/**
 * 文件：src/systems/StorySystem.js
 * 作用：结束本回合后抽出一串小故事。安排了几格就有几页，再随机多 1～2 件。
 * 压力高、满意度低时，每一页更容易往坏的一边偏。
 */

import { getStoryById, STORIES } from '../data/stories.js';
import { mulberry32 } from '../utils/rng.js';
import { changeSatisfaction, checkMoodLines } from './MoodSystem.js';
import { planTags, tagsForAction } from './EventSystem.js';
import { applyEffects } from './StatSystem.js';
import { previewSheetChanges, syncSheet } from './SheetSystem.js';

function hashId(id = '') {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n = (n * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(n);
}

function rngFor(state, id, page = 0) {
  return mulberry32(state.seed + state.roundSerial * 91 + hashId(id) + page * 13 + 17);
}

/** 压力高、满意度低 → 故事更容易往坏的一边偏。返回 -1 到 1。 */
export function storyBias(state) {
  const stress = state.child.stats.stress;
  const sat = state.household.satisfaction;
  let bias = 0;
  if (stress >= 75) bias -= 0.5;
  else if (stress >= 55) bias -= 0.22;
  else if (stress <= 25) bias += 0.28;
  if (sat >= 75) bias += 0.32;
  else if (sat <= 30) bias -= 0.34;
  else if (sat <= 45) bias -= 0.12;
  return Math.max(-0.9, Math.min(0.9, bias));
}

export function storyProgress(state) {
  ensureQueue(state);
  const queue = state.pendingStories || [];
  const index = state.pendingStoryIndex || 0;
  return {
    queue,
    index,
    total: queue.length,
    last: queue.length === 0 || index >= queue.length - 1,
    story: getStoryById(queue[index] || state.pendingStoryId),
  };
}

function ensureQueue(state) {
  if (Array.isArray(state.pendingStories) && state.pendingStories.length > 0) return;
  if (state.pendingStoryId) {
    state.pendingStories = [state.pendingStoryId];
    state.pendingStoryIndex = state.pendingStoryIndex || 0;
  }
}

/**
 * 安排几格 → 几页跟着走的故事，再随机多 1 或 2 件。
 * 同一串里尽量不重复。
 */
export function pickStoryQueue(state) {
  ensureQueue(state);
  if (state.pendingStories?.length) {
    return state.pendingStories.map(getStoryById).filter(Boolean);
  }
  const played = state.justPlayed || [];
  const rng = mulberry32(state.seed + state.roundSerial * 67 + 11);
  const extra = rng() < 0.5 ? 1 : 2;
  const used = new Set();
  const queue = [];
  played.forEach((id, index) => {
    const story = pickOne(state, tagsForAction(id), used, index);
    if (!story) return;
    queue.push(story);
    used.add(story.id);
  });
  for (let i = 0; i < extra; i += 1) {
    const story = pickOne(state, planTags(state), used, played.length + i);
    if (!story) continue;
    queue.push(story);
    used.add(story.id);
  }
  return queue;
}

export function pickStory(state) {
  const queue = pickStoryQueue(state);
  return queue[0] || null;
}

function pickOne(state, tagged, used, salt) {
  const unique = STORIES.filter((story) => eligible(story, state) && !used.has(story.id));
  const pool = unique.length > 0
    ? unique
    : STORIES.filter((story) => story.stage === state.yearIndex);
  if (pool.length === 0) return STORIES.find((story) => story.once === false) || STORIES[0];
  return pickWeighted(pool, state, tagged, salt);
}

function eligible(story, state) {
  if (story.stage != null && story.stage !== state.yearIndex) return false;
  if (story.needFriend && !state.friend?.unlocked) return false;
  return true;
}

function pickWeighted(pool, state, tagged, salt = 0) {
  const scored = pool.map((story) => ({
    story,
    weight: Math.max(1, storyWeight(story, state, tagged)),
  }));
  const total = scored.reduce((sum, item) => sum + item.weight, 0);
  let roll = mulberry32(state.seed + state.roundSerial * 47 + salt * 19 + 5)() * total;
  for (const item of scored) {
    roll -= item.weight;
    if (roll <= 0) return item.story;
  }
  return scored[scored.length - 1].story;
}

function storyWeight(story, state, tagged) {
  let weight = 3;
  const tags = story.tags || [];
  if (tags.some((tag) => tagged.has(tag))) weight += 8;
  if (story.lane === 'home' && (state.household.satisfaction <= 35 || state.household.satisfaction >= 80)) weight += 5;
  if (story.lane === 'play' && state.child.stats.stress >= 60) weight += 4;
  if (story.lane === 'study' && tagged.has('study')) weight += 3;
  if (tags.includes('friend') && state.friend?.actedThisRound && (!story.pal || story.pal === state.friend.lastId)) weight += 5;
  if (story.once === false) weight += 1;
  return weight;
}

export function rollStoryResult(state, story, page = 0) {
  const next = rngFor(state, story.id, page);
  const bias = storyBias(state);
  const towardGood = next() < 0.5 + bias * 0.42;
  const mix = towardGood ? 0.72 + next() * 0.28 : 0.18 + next() * 0.28;
  const pages = Math.max(1, state.pendingStories?.length || 1);
  const factor = Math.min(1, 1.2 / pages);
  const effects = scaleEffects(mixEffects(story.good || {}, story.bad || {}, mix), factor);
  const stressSign = towardGood ? -1 : 1;
  const stressMag = 4 + Math.floor(next() * 5);
  effects.stress = stressSign * stressMag;
  const insight = next() < (0.16 + Math.max(0, bias) * 0.12) / pages ? 2 + Math.floor(next() * 2) : 0;
  const satMag = 4 + Math.floor(next() * 5);
  const sat = (towardGood ? 1 : -1) * satMag;
  return {
    effects,
    sheet: previewSheetChanges(effects),
    insight,
    sat,
    towardGood,
    mix,
  };
}

function scaleEffects(effects, factor) {
  const scaled = {};
  Object.entries(effects).forEach(([key, value]) => {
    const next = Math.round(value * factor);
    if (next) scaled[key] = next;
  });
  return scaled;
}

function mixEffects(good, bad, mix) {
  const keys = new Set([...Object.keys(good), ...Object.keys(bad)]);
  const effects = {};
  keys.forEach((key) => {
    if (!good[key] && !bad[key]) return;
    const value = Math.round((good[key] || 0) * mix + (bad[key] || 0) * (1 - mix));
    if (value) effects[key] = value;
  });
  return effects;
}

/** 结算当前这一页。还没翻完时 done 为 false，pendingStoryId 指向下一页。 */
export function resolveStory(state) {
  ensureQueue(state);
  const index = state.pendingStoryIndex || 0;
  const story = getStoryById(state.pendingStoryId || state.pendingStories?.[index]);
  if (!story) {
    state.pendingStoryId = null;
    state.pendingStories = [];
    state.pendingStoryIndex = 0;
    return { story: null, changes: {}, notices: [], done: true };
  }
  const rolled = rollStoryResult(state, story, index);
  const coreChanges = applyEffects(state.child.stats, rolled.effects);
  const changes = syncSheet(state.child, rolled.effects);
  if (coreChanges.stress) changes.stress = coreChanges.stress;
  if (rolled.insight) {
    state.household.insight += rolled.insight;
    changes.insight = rolled.insight;
  }
  if (rolled.sat) changes.satisfaction = changeSatisfaction(state, rolled.sat);
  state.seenStories = state.seenStories || [];
  if (story.once !== false && !state.seenStories.includes(story.id)) {
    state.seenStories.push(story.id);
  }
  state.pushLog(`${story.title}。`);
  const nextIndex = index + 1;
  const queue = state.pendingStories || [];
  if (nextIndex < queue.length) {
    state.pendingStoryIndex = nextIndex;
    state.pendingStoryId = queue[nextIndex];
    return { story, rolled, changes, notices: checkMoodLines(state), done: false };
  }
  state.pendingStoryId = null;
  state.pendingStories = [];
  state.pendingStoryIndex = 0;
  return { story, rolled, changes, notices: checkMoodLines(state), done: true };
}

export { getStoryById };
