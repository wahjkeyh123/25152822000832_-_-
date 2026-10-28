/**
 * 文件：src/data/skills.js
 * 作用：右侧「学习」里的技能。学会要花悟性，效果写在七项属性上。
 * 学会只是解锁。真正加减属性，要在「安排」里排进本轮，结束时期时执行。
 *
 * 字段说明：
 * - stage：哪个时期出现在「本期」标签页。职业技能没有 stage，改用 career。
 * - energy：大于 0 的是放松技能，执行后额外回复精力。
 * - money：执行后增加积蓄，目前只有打零工。
 * - auto：不用花悟性，到了这个时期自动会。
 * - core：同时改内部的学识、体质、心情、压力，高考和崩溃看的是它们。
 */

import { getStage } from './stages.js';

export const SKILLS = [
  { id: 'point', stage: 'baby', name: '认身边的东西', cost: 4, energy: 0, effects: { iq: 4, memory: 2 }, core: { study: 3, stress: 2 }, detail: '灯、碗、手，一个一个指给他看。' },
  { id: 'call', stage: 'baby', name: '学叫人', cost: 4, energy: 0, effects: { eq: 3, charm: 2 }, core: { mood: 2, stress: 1 }, detail: '饿了困了，先试着叫，不用只靠哭。' },
  { id: 'grab', stage: 'baby', name: '伸手去抓', cost: 3, energy: 0, effects: { physique: 4 }, core: { body: 3, stress: 1 }, detail: '够得着的玩具，让他自己拿。' },
  { id: 'colors', stage: 'baby', name: '看颜色', cost: 4, energy: 5, effects: { imagination: 4 }, core: { mood: 3, stress: -3 }, detail: '红的和蓝的分开，他会盯很久。' },
  { id: 'peekaboo', stage: 'baby', name: '躲猫猫', cost: 3, energy: 5, effects: { charm: 3, eq: 1 }, core: { mood: 3, stress: -2 }, detail: '手一拿开，他就笑出声。' },
  { id: 'sounds', stage: 'baby', name: '听不同的声音', cost: 4, energy: 0, effects: { memory: 3, iq: 1 }, core: { study: 2, stress: 1 }, detail: '水壶、门铃、雨声，听多了会转头找。' },

  { id: 'story', stage: 'kinder', name: '听完一个故事', cost: 4, energy: 5, effects: { eq: 3, imagination: 3 }, core: { mood: 3, stress: -3 }, detail: '听到最后再问他：然后呢。' },
  { id: 'rhyme', stage: 'kinder', name: '背一首儿歌', cost: 4, energy: 0, effects: { memory: 4 }, core: { study: 3, stress: 2 }, detail: '短的那首，唱错了也不纠正第二遍。' },
  { id: 'yard', stage: 'kinder', name: '在院子里跑', cost: 3, energy: 10, effects: { physique: 3, charm: 1 }, core: { body: 3, mood: 3, stress: -4 }, detail: '跑到门口再跑回来，算一次。' },
  { id: 'hello', stage: 'kinder', name: '跟人打招呼', cost: 4, energy: 0, effects: { face: 2, charm: 2 }, core: { mood: 2, stress: 1 }, detail: '先看对方的眼睛，再开口。' },
  { id: 'blocks', stage: 'kinder', name: '搭一座积木城', cost: 4, energy: 0, effects: { imagination: 3, iq: 2 }, core: { study: 2, mood: 1 }, detail: '塌了就再搭，这次换个地基。' },
  { id: 'sing-up', stage: 'kinder', name: '上台唱一句', cost: 4, energy: 0, effects: { face: 3, charm: 2 }, core: { mood: 1, stress: 2 }, detail: '只唱第一句，下来就给他鼓掌。' },

  { id: 'explain', stage: 'middle', name: '把题讲顺', cost: 5, energy: 0, effects: { iq: 3, memory: 2 }, core: { study: 4, stress: 3 }, detail: '用自己的话说一遍，比再抄一遍有用。' },
  { id: 'discuss', stage: 'middle', name: '小组里说一句', cost: 4, energy: 0, effects: { eq: 3, face: 1 }, core: { mood: 2, stress: 2 }, detail: '不用抢第一句，但要有一句。' },
  { id: 'ball', stage: 'middle', name: '放学打一会儿球', cost: 4, energy: 10, effects: { physique: 3, charm: 2 }, core: { body: 3, mood: 4, stress: -5 }, detail: '球衣可以脏，晚饭前要回来。' },
  { id: 'diary', stage: 'middle', name: '写给自己的话', cost: 4, energy: 5, effects: { imagination: 2, eq: 2 }, core: { mood: 3, stress: -3 }, detail: '不交给老师，只交给他自己。' },
  { id: 'duty', stage: 'middle', name: '当一天值日班长', cost: 4, energy: 0, effects: { face: 3, eq: 2 }, core: { mood: 1, stress: 2 }, detail: '喊一声起立，全班真的站起来了。' },
  { id: 'words', stage: 'middle', name: '每天背十个单词', cost: 4, energy: 0, effects: { memory: 4 }, core: { study: 3, stress: 2 }, detail: '睡前看一遍，早上再看一遍。' },

  { id: 'review', stage: 'high', name: '错题再看一遍', cost: 5, energy: 0, effects: { iq: 4, memory: 2 }, core: { study: 4, stress: 3 }, detail: '只看错的那几道，不重做整张卷。' },
  { id: 'compare', stage: 'high', name: '和同桌对答案', cost: 4, energy: 0, effects: { eq: 2, memory: 2 }, core: { study: 2, stress: 2 }, detail: '对的是思路，不是最后那个数。' },
  { id: 'laps', stage: 'high', name: '操场跑两圈', cost: 3, energy: 10, effects: { physique: 3 }, core: { body: 3, mood: 3, stress: -4 }, detail: '跑完再坐下看书。' },
  { id: 'say-it', stage: 'high', name: '把紧张说出来', cost: 4, energy: 10, effects: { face: 2, eq: 3 }, core: { mood: 4, stress: -5 }, detail: '说给家里人听，不必说给全班听。' },
  { id: 'speech', stage: 'high', name: '升旗时讲两分钟', cost: 4, energy: 0, effects: { face: 3, charm: 3 }, core: { mood: 1, stress: 3 }, detail: '稿子背熟了，手还是会抖。' },
  { id: 'formula', stage: 'high', name: '整理一本公式本', cost: 5, energy: 0, effects: { iq: 3, memory: 3 }, core: { study: 4, stress: 3 }, detail: '自己抄的那本，考前只翻它。' },
  { id: 'parttime', stage: 'high', name: '周末打零工', cost: 0, energy: 0, money: 15, auto: true, effects: {}, core: { stress: 1 }, detail: '奶茶店站一下午，钱是自己挣的。' },

  { id: 'lab-notes', career: 'scientist', name: '做一份实验记录', cost: 5, energy: 0, effects: { iq: 5, memory: 3 }, core: { study: 4, stress: 2 }, detail: '数据不对也记下来，那才是线索。' },
  { id: 'contest', career: 'scientist', name: '攻一道竞赛题', cost: 5, energy: 0, effects: { iq: 6 }, core: { study: 4, stress: 3 }, detail: '想了三天，第四天早上在牙刷前想通。' },
  { id: 'body-map', career: 'doctor', name: '认一张人体图', cost: 5, energy: 0, effects: { memory: 5, iq: 2 }, core: { study: 4, stress: 2 }, detail: '二百零六块骨头，先认手上的。' },
  { id: 'first-aid', career: 'doctor', name: '学一次急救', cost: 5, energy: 0, effects: { eq: 4, physique: 2 }, core: { body: 2, mood: 1 }, detail: '按压的节奏，跟着一首歌数。' },
  { id: 'short-story', career: 'writer', name: '写完一篇小说', cost: 5, energy: 5, effects: { imagination: 6, eq: 1 }, core: { mood: 3, stress: -1 }, detail: '结尾改了五次，第一次的最好。' },
  { id: 'thick-book', career: 'writer', name: '读完一本厚书', cost: 5, energy: 0, effects: { imagination: 3, memory: 3 }, core: { study: 2, mood: 1 }, detail: '书签从第一页挪到最后一页。' },
  { id: 'sketch', career: 'designer', name: '画一本速写', cost: 5, energy: 5, effects: { imagination: 5, charm: 2 }, core: { mood: 3, stress: -1 }, detail: '公交车上的人，都在本子里。' },
  { id: 'redo-room', career: 'designer', name: '改造自己的房间', cost: 5, energy: 0, effects: { imagination: 3, charm: 4 }, core: { mood: 2 }, detail: '书桌换个方向，光就不一样了。' },
  { id: 'training', career: 'athlete', name: '跟着体校训练', cost: 5, energy: 0, effects: { physique: 6 }, core: { body: 4, stress: 2 }, detail: '腿酸到下楼要扶墙。' },
  { id: 'match', career: 'athlete', name: '打一场正式比赛', cost: 5, energy: 0, effects: { physique: 3, charm: 3 }, core: { body: 2, mood: 2 }, detail: '输了也要跟对手握手。' },
  { id: 'mirror-host', career: 'host', name: '对着镜子主持', cost: 5, energy: 0, effects: { charm: 4, face: 3 }, core: { mood: 1, stress: 1 }, detail: '开场白说到不看稿为止。' },
  { id: 'radio', career: 'host', name: '去校园广播站', cost: 5, energy: 0, effects: { face: 4, eq: 2 }, core: { mood: 2, stress: 1 }, detail: '午饭时间，全校都在听他的声音。' },
  { id: 'debate', career: 'lawyer', name: '打一场辩论赛', cost: 5, energy: 0, effects: { eq: 3, face: 3, memory: 1 }, core: { study: 2, stress: 2 }, detail: '先听完对方，再站起来。' },
  { id: 'clauses', career: 'lawyer', name: '读几条法条', cost: 5, energy: 0, effects: { memory: 5, iq: 1 }, core: { study: 3, stress: 2 }, detail: '每一个「但是」后面都有故事。' },
  { id: 'tutor-friend', career: 'teacher', name: '给同学讲一道题', cost: 5, energy: 0, effects: { eq: 4, memory: 2 }, core: { study: 2, mood: 2 }, detail: '讲到第三遍，自己也真的懂了。' },
  { id: 'lesson-plan', career: 'teacher', name: '写一份小教案', cost: 5, energy: 0, effects: { memory: 3, eq: 3 }, core: { study: 2, stress: 1 }, detail: '先想好第一句怎么开口。' },
];

export function getSkillById(id) {
  return SKILLS.find((skill) => skill.id === id) || null;
}

export function getSkillsForStage(yearIndex) {
  const stage = getStage(yearIndex);
  return SKILLS.filter((skill) => skill.stage === stage.id);
}

/** 某个职业的专属技能，买了这个职业的书才会出现。 */
export function getCareerSkills(careerId) {
  return SKILLS.filter((skill) => skill.career === careerId);
}

/** 打零工这类自动会的技能，只在它自己的时期算「会」。 */
export function isLearned(state, skill) {
  if (!skill) return false;
  if (skill.auto) return skill.stage === getStage(state.yearIndex).id;
  return state.learnedSkills.includes(skill.id);
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

/** 已经会的技能，按表里的顺序，不限时期。 */
export function learnedSkillList(state) {
  return SKILLS.filter((skill) => isLearned(state, skill));
}
