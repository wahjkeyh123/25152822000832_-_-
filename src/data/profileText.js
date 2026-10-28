/**
 * 文件：src/data/profileText.js
 * 作用：点头像之后那页个人信息的句子。
 * 句子跟时期和当前状态走，不写死成某一个别人家的孩子。
 */

import { ATTRIBUTES } from './attributes.js';
import { getStage } from './stages.js';
import { getSkillById } from './skills.js';
import { describeChild } from '../systems/StatSystem.js';
import { fillName } from '../utils/text.js';

const FRIENDS = {
  baby: '还没有可以一起玩的人。醒着的时候，屋里就是{ta}的全部。',
  kinder: '同班的圆圆愿意把蜡笔分{ta}一半。别的孩子{ta}还叫不出名字。',
  middle: '球友阿宁放学只想多打一会儿。作业的事，他们很少谈。',
  high: '同桌林夏笔记借{ta}，不问这一次考了多少。',
};

const PLACE = {
  baby: '家里',
  kinder: '幼儿园',
  middle: '初中部',
  high: '高中部',
};

const ADVICE = {
  iq: '这个时期先把一件事看明白，比同时开三门课有用。',
  eq: '{ta}不是不肯说，是还没找到可以说的人。晚饭时留一句空。',
  imagination: '留一点不被安排的时间。空着，{ta}才会自己找事做。',
  memory: '短的、重复的，比一次塞很多更容易留下。',
  physique: '这一期至少让{ta}出一次门，不要整天坐着。',
  charm: '被人记住，靠的是{ta}开口的那一次，不是分数。',
  face: '面子现在很薄。当众纠正，会比错题更伤。',
};

export function buildProfile(state) {
  const stage = getStage(state.yearIndex);
  const sheet = state.child.sheet;
  let lowest = ATTRIBUTES[0].key;
  ATTRIBUTES.forEach((attr) => {
    if ((sheet[attr.key] ?? 0) < (sheet[lowest] ?? 0)) lowest = attr.key;
  });
  const stress = state.child.stats.stress;
  let temper = '这一期还稳得住，晚饭时会应声。';
  if (stress >= 70) temper = '绷得很紧，叫{ta}常常要等两秒。';
  else if (stress <= 25) temper = '还笑得出来，也肯把白天的事说一半。';
  const done = state.lastPlan || [];
  const pushed = done.filter((id) => (getSkillById(id)?.core?.study ?? 0) > 0).length;
  let style = '最近还没怎么安排，先看着{ta}。';
  if (done.length > 0 && pushed >= done.length) style = '上一回合排得比较满，课比玩多。';
  else if (pushed === 0 && done.length > 0) style = '上一回合让{ta}歇得多，课排得少。';
  else if (done.length > 0) style = '课和休息都有，没有只往一头倒。';

  const child = state.child;
  return {
    name: child.name,
    gender: child.gender === 'girl' ? '女孩' : '男孩',
    age: `${stage.age} 岁`,
    place: PLACE[stage.id] || stage.grade,
    friends: fillName(FRIENDS[stage.id] || FRIENDS.baby, child),
    mood: fillName(describeChild(child.stats, stage), child),
    temper: fillName(temper, child),
    style: fillName(style, child),
    knot: stress,
    advice: fillName(ADVICE[lowest], child),
  };
}
