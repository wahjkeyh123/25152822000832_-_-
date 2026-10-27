/**
 * 文件：src/data/actions.js
 * 作用：所有时期的活动总表。某个时期看不看得到，由 stages.js 的 actionIds 决定。
 *
 * 想给「幼儿园」加一个活动：在这里复制一块，换一个不重复的 id，
 * 再把这个 id 写进 stages.js 里幼儿园的 actionIds。
 * 一个时期建议不要超过 6 个，否则按钮上的字会挤。
 */

import { getStage } from './stages.js';

export const ACTIONS = [
  { id: 'soothe', name: '哄睡', cost: 0, energy: 1, effects: { mood: 8, stress: -8, body: 3 } },
  { id: 'early-edu', name: '早教游戏', cost: 0, energy: 1, effects: { study: 8, mood: 4, stress: 4 } },
  { id: 'toy', name: '买玩具', cost: 16, energy: 1, effects: { mood: 12, stress: -4, study: 1 } },
  { id: 'food', name: '加一顿辅食', cost: 10, energy: 1, effects: { body: 12, mood: 4, stress: -2 } },
  { id: 'baby-class', name: '早教班', cost: 36, energy: 1, effects: { study: 14, stress: 10, mood: -4 } },

  { id: 'play', name: '在家玩', cost: 0, energy: 1, effects: { mood: 10, stress: -8, body: 3 } },
  { id: 'letters', name: '认字画画', cost: 0, energy: 1, effects: { study: 12, mood: 2, stress: 6 } },
  { id: 'park', name: '去公园', cost: 8, energy: 1, effects: { mood: 10, body: 8, stress: -8, study: -1 } },
  { id: 'hobby', name: '兴趣班', cost: 28, energy: 1, effects: { study: 14, stress: 9, mood: -4 } },
  { id: 'nap', name: '睡午觉', cost: 0, energy: 1, effects: { stress: -10, mood: 6, body: 2 } },

  { id: 'homework', name: '写作业', cost: 0, energy: 1, effects: { study: 14, stress: 8, mood: -4 } },
  { id: 'tutor', name: '补习班', cost: 36, energy: 1, effects: { study: 18, stress: 12, mood: -8 } },
  { id: 'sport', name: '打球', cost: 6, energy: 1, effects: { body: 12, mood: 6, stress: -8 } },
  { id: 'rest', name: '在家休息', cost: 0, energy: 1, effects: { mood: 8, stress: -10, body: 2 } },
  { id: 'outing', name: '出去玩', cost: 10, energy: 1, effects: { mood: 12, stress: -10, study: -3, body: 4 } },

  { id: 'drill', name: '刷题', cost: 0, energy: 1, effects: { study: 16, stress: 10, mood: -6 } },
  { id: 'cram', name: '冲刺班', cost: 40, energy: 1, effects: { study: 20, stress: 14, mood: -8 } },
  { id: 'run', name: '跑步', cost: 6, energy: 1, effects: { body: 10, mood: 6, stress: -8 } },
  { id: 'sleep', name: '睡觉', cost: 0, energy: 1, effects: { stress: -12, mood: 8, body: 2 } },
  { id: 'walk', name: '出门走走', cost: 8, energy: 1, effects: { mood: 10, stress: -8, study: -2, body: 4 } },
];

export function getAction(id) {
  return ACTIONS.find((action) => action.id === id) || null;
}

/** 当前时期的按钮。顺序跟 stages.js 里的 actionIds 一致，也是键盘 1、2、3 的顺序。 */
export function getActionsForStage(yearIndex) {
  const stage = getStage(yearIndex);
  return stage.actionIds.map((id) => getAction(id)).filter(Boolean);
}
