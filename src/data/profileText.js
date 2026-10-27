/**
 * 文件：src/data/profileText.js
 * 作用：点头像之后那页个人信息的句子。
 * 句子跟时期和当前状态走，不写死成某一个别人家的孩子。
 */

import { ATTRIBUTES } from './attributes.js';
import { getStage } from './stages.js';
import { describeChild } from '../systems/StatSystem.js';

const FRIENDS = {
  baby: '还没有可以一起玩的人。醒着的时候，屋里就是他的全部。',
  kinder: '同班的圆圆愿意把蜡笔分他一半。别的孩子他还叫不出名字。',
  middle: '球友阿宁放学只想多打一会儿。作业的事，他们很少谈。',
  high: '同桌林夏笔记借他，不问这一次考了多少。',
};

const PLACE = {
  baby: '家里',
  kinder: '幼儿园',
  middle: '初中部',
  high: '高中部',
};

const ADVICE = {
  iq: '这个时期先把一件事看明白，比同时开三门课有用。',
  eq: '他不是不肯说，是还没找到可以说的人。晚饭时留一句空。',
  imagination: '留一点不被安排的时间。空着，他才会自己找事做。',
  memory: '短的、重复的，比一次塞很多更容易留下。',
  physique: '这一期至少让他出一次门，不要整天坐着。',
  charm: '被人记住，靠的是他开口的那一次，不是分数。',
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
  if (stress >= 70) temper = '绷得很紧，叫他常常要等两秒。';
  else if (stress <= 25) temper = '还笑得出来，也肯把白天的事说一半。';
  const pushed = state.actionsThisYear.filter((id) => (
    ['early-edu', 'baby-class', 'letters', 'hobby', 'homework', 'tutor', 'drill', 'cram'].includes(id)
  )).length;
  let style = '这一期还没怎么安排，先看着他。';
  if (state.actionsThisYear.length > 0 && pushed >= state.actionsThisYear.length) style = '你这一期排得比较满，课比玩多。';
  else if (pushed === 0 && state.actionsThisYear.length > 0) style = '你这一期让他歇得多，课排得少。';
  else if (state.actionsThisYear.length > 0) style = '课和休息都有，没有只往一头倒。';

  return {
    name: state.child.name,
    age: `${stage.age} 岁`,
    place: PLACE[stage.id] || stage.grade,
    friends: FRIENDS[stage.id] || FRIENDS.baby,
    mood: describeChild(state.child.stats, stage),
    temper,
    style,
    knot: stress,
    advice: ADVICE[lowest],
  };
}
