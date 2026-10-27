/**
 * 文件：src/data/skills.js
 * 作用：右侧「学习」里的技能。学会要花悟性，效果写在七项属性上。
 * 学会只是解锁。真正加减属性，要在「安排」里执行。
 * energy 大于 0 的是放松技能，执行后额外回复精力。
 */

import { getStage } from './stages.js';

export const SKILLS = [
  { id: 'point', stage: 'baby', name: '认身边的东西', cost: 4, energy: 0, effects: { iq: 4, memory: 2 }, core: { study: 3, stress: 2 }, detail: '灯、碗、手，一个一个指给他看。' },
  { id: 'call', stage: 'baby', name: '学叫人', cost: 4, energy: 0, effects: { eq: 3, charm: 2 }, core: { mood: 2, stress: 1 }, detail: '饿了困了，先试着叫，不用只靠哭。' },
  { id: 'grab', stage: 'baby', name: '伸手去抓', cost: 3, energy: 0, effects: { physique: 4 }, core: { body: 3, stress: 1 }, detail: '够得着的玩具，让他自己拿。' },
  { id: 'colors', stage: 'baby', name: '看颜色', cost: 4, energy: 5, effects: { imagination: 4 }, core: { mood: 3, stress: -3 }, detail: '红的和蓝的分开，他会盯很久。' },

  { id: 'story', stage: 'kinder', name: '听完一个故事', cost: 4, energy: 5, effects: { eq: 3, imagination: 3 }, core: { mood: 3, stress: -3 }, detail: '听到最后再问他：然后呢。' },
  { id: 'rhyme', stage: 'kinder', name: '背一首儿歌', cost: 4, energy: 0, effects: { memory: 4 }, core: { study: 3, stress: 2 }, detail: '短的那首，唱错了也不纠正第二遍。' },
  { id: 'yard', stage: 'kinder', name: '在院子里跑', cost: 3, energy: 10, effects: { physique: 3, charm: 1 }, core: { body: 3, mood: 3, stress: -4 }, detail: '跑到门口再跑回来，算一次。' },
  { id: 'hello', stage: 'kinder', name: '跟人打招呼', cost: 4, energy: 0, effects: { face: 2, charm: 2 }, core: { mood: 2, stress: 1 }, detail: '先看对方的眼睛，再开口。' },

  { id: 'explain', stage: 'middle', name: '把题讲顺', cost: 5, energy: 0, effects: { iq: 3, memory: 2 }, core: { study: 4, stress: 3 }, detail: '用自己的话说一遍，比再抄一遍有用。' },
  { id: 'discuss', stage: 'middle', name: '小组里说一句', cost: 4, energy: 0, effects: { eq: 3, face: 1 }, core: { mood: 2, stress: 2 }, detail: '不用抢第一句，但要有一句。' },
  { id: 'ball', stage: 'middle', name: '放学打一会儿球', cost: 4, energy: 10, effects: { physique: 3, charm: 2 }, core: { body: 3, mood: 4, stress: -5 }, detail: '球衣可以脏，晚饭前要回来。' },
  { id: 'diary', stage: 'middle', name: '写给自己的话', cost: 4, energy: 5, effects: { imagination: 2, eq: 2 }, core: { mood: 3, stress: -3 }, detail: '不交给老师，只交给他自己。' },

  { id: 'review', stage: 'high', name: '错题再看一遍', cost: 5, energy: 0, effects: { iq: 4, memory: 2 }, core: { study: 4, stress: 3 }, detail: '只看错的那几道，不重做整张卷。' },
  { id: 'compare', stage: 'high', name: '和同桌对答案', cost: 4, energy: 0, effects: { eq: 2, memory: 2 }, core: { study: 2, stress: 2 }, detail: '对的是思路，不是最后那个数。' },
  { id: 'laps', stage: 'high', name: '操场跑两圈', cost: 3, energy: 10, effects: { physique: 3 }, core: { body: 3, mood: 3, stress: -4 }, detail: '跑完再坐下看书。' },
  { id: 'say-it', stage: 'high', name: '把紧张说出来', cost: 4, energy: 10, effects: { face: 2, eq: 3 }, core: { mood: 4, stress: -5 }, detail: '说给家里人听，不必说给全班听。' },
];

export function getSkillById(id) {
  return SKILLS.find((skill) => skill.id === id) || null;
}

/** 这项技能加得最多的那一项。学习卡片上的「主加」用它。 */
export function mainEffect(skill) {
  let key = null;
  let amount = 0;
  Object.entries(skill?.effects || {}).forEach(([stat, value]) => {
    if (value > amount) {
      key = stat;
      amount = value;
    }
  });
  if (!key) return null;
  return { key, amount };
}

/** 已经学会的技能，按表里的顺序，不限当前时期。 */
export function learnedSkillList(state) {
  return SKILLS.filter((skill) => state.learnedSkills.includes(skill.id));
}

export function getSkillsForStage(yearIndex) {
  const stage = getStage(yearIndex);
  return SKILLS.filter((skill) => skill.stage === stage.id);
}
