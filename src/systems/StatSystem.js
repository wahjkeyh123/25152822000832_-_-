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

/** 右侧人物卡和个人信息里的心理状态。跟着压力和心情走。 */
export function describeChild(stats, stage) {
  const stress = stats.stress ?? 0;
  const mood = stats.mood ?? 0;
  if (stage?.id === 'baby') {
    if (stress >= 70) return '{name}夜里醒得勤，抱着也不肯安稳。';
    if (stress >= 45) return '{name}容易惊，要人在旁边才肯睡。';
    return '{name}吃饱了，眼睛还亮着。';
  }
  if (stress >= 85) return '{name}话很少，肩膀是垮的。叫{ta}要等两秒。';
  if (stress >= 70) return '{name}最近睡不好，晚饭也吃得很少。';
  if (stress >= 55) return '{name}心里压着一口气，笑也是敷衍的。';
  if (mood <= 30) return '{name}话变少了，叫{ta}要应两声。';
  if (stress <= 20 && mood >= 70) return '{name}还轻松，肯把白天的事说给你听。';
  if (stage?.id === 'kinder') return '{name}还会拉你的手去门口。';
  if (stage?.id === 'elem') return '{name}会把今天学会的字念给你听。';
  if (stats.study <= 35) return '这个时期该看的东西，还有很多空着。';
  if (stats.body <= 35) return '体育课已经开始喘。';
  return '晚饭时，{name}还会主动说话。';
}

/** 心结：把压力翻译成现在这个人的状态，不只显示数字。 */
export function knotFor(stress = 0) {
  if (stress >= 85) {
    return {
      label: '快撑不住了',
      color: '#a33b32',
      fill: 0xf3d0c8,
      text: '心结已经顶到喉咙口。先让{ta}睡一晚，再谈分数。',
    };
  }
  if (stress >= 70) {
    return {
      label: '心里堵着',
      color: '#c45c26',
      fill: 0xf6e0cc,
      text: '肩膀是紧的，晚饭吃得少。这一阵先别再加事。',
    };
  }
  if (stress >= 55) {
    return {
      label: '压着一口气',
      color: '#a35a1f',
      fill: 0xf4e4cc,
      text: '表面上还过得去，问重了才露出烦。这一阵别再往日历上加东西。',
    };
  }
  if (stress >= 35) {
    return {
      label: '有点心事',
      color: '#8a5a36',
      fill: 0xf4ead8,
      text: '还撑得住，只是不如以前爱说话。留一点不被安排的晚上。',
    };
  }
  if (stress >= 15) {
    return {
      label: '还算平稳',
      color: '#6b4b30',
      fill: 0xf4e4cc,
      text: '心结不重。该学的学，该歇的歇，{ta}还跟得上。',
    };
  }
  return {
    label: '几乎没有心结',
    color: '#2f7d57',
    fill: 0xe5f2e4,
    text: '心里是空的、轻的。这种时候最适合把白天的事听完。',
  };
}

export function faceFor(stats, stage) {
  const bad = stats.stress >= 75 || stats.mood <= 30;
  if (bad) return stage?.faceBad || '😣';
  return stage?.faceOk || '🙂';
}
