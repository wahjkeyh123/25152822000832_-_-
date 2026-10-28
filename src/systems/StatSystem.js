/**
 * 文件：src/systems/StatSystem.js
 * 作用：只负责改四项属性，并保证它们留在 0 到 100。
 * 活动、事件、学年结算都要经过这里，避免有的地方忘了封顶。
 */

import { STAT_KEYS, STAT_LABEL, STAT_MAX, STAT_MIN } from '../config/constants.js';
import clamp from '../utils/clamp.js';

/** 改属性。返回实际变化量（被上下限截断之后的），供飘字使用。 */
export function applyEffects(stats, effects = {}) {
  const changes = {};
  Object.keys(effects).forEach((key) => {
    if (!STAT_KEYS.includes(key) || !effects[key]) return;
    const before = stats[key];
    const after = clamp(before + effects[key], STAT_MIN, STAT_MAX);
    stats[key] = after;
    const delta = after - before;
    if (delta !== 0) changes[key] = delta;
  });
  return changes;
}

export function formatChanges(changes = {}) {
  const parts = [];
  STAT_KEYS.forEach((key) => {
    if (!changes[key]) return;
    const value = changes[key];
    parts.push(`${STAT_LABEL[key]}${value > 0 ? '+' : ''}${value}`);
  });
  return parts.join('，') || '没有变化';
}

/** 按钮上的短句，每行最多 perLine 个，避免字画出按钮。 */
export function formatEffectLines(effects = {}, perLine = 2) {
  const parts = [];
  STAT_KEYS.forEach((key) => {
    if (!effects[key]) return;
    const value = effects[key];
    parts.push(`${STAT_LABEL[key]}${value > 0 ? '+' : ''}${value}`);
  });
  if (parts.length === 0) parts.push('属性不变');
  const lines = [];
  for (let index = 0; index < parts.length; index += perLine) {
    lines.push(parts.slice(index, index + perLine).join('  '));
  }
  return lines;
}

/** 右侧人物卡的一句话。这是给玩家的即时反馈，不是结局判断。 */
export function describeChild(stats, stage) {
  const tired = stats.stress >= 75 || stats.mood <= 28;
  if (stage?.id === 'baby') {
    return tired ? '{name}夜里醒得勤，抱着也不肯安稳。' : '{name}吃饱了，眼睛还亮着。';
  }
  if (stage?.id === 'kinder') {
    return tired ? '{name}到了门口就摇头，不想再背那个包。' : '{name}还会拉你的手去门口。';
  }
  if (tired) return '{name}最近睡不好，晚饭也吃得很少。';
  if (stats.mood <= 45) return '{name}话变少了，叫{ta}要应两声。';
  if (stats.study <= 35) return '这个时期该看的东西，还有很多空着。';
  if (stats.body <= 35) return '体育课已经开始喘。';
  return '晚饭时，{name}还会主动说话。';
}

export function faceFor(stats, stage) {
  const bad = stats.stress >= 75 || stats.mood <= 30;
  if (bad) return stage?.faceBad || '😣';
  return stage?.faceOk || '🙂';
}
