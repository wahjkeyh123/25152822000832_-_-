/**
 * 文件：src/data/friends.js
 * 作用：初中出现的三个同学会。同桌林舟、后座顾河、值日搭子陈勉。
 * 亲密度 0 到 100，每人一条。每回合只能找一个人；够 45 可以约周末。
 * 找过的人更容易出现在当天的事里。
 */

export const FRIEND_OPEN_INDEX = 3;
export const CLOSENESS_MAX = 100;
export const WEEKEND_NEED = 45;

export const FRIENDS = [
  {
    id: 'lin-zhou',
    name: '林舟',
    title: '同桌',
    glyph: '舟',
    color: 0x3d6ea8,
    line: '坐在前一排。铅笔盒里永远多一支，跑步总是最后。',
    words: [
      [75, '有些话只跟对方说'],
      [45, '会把不好的分数先给对方看'],
      [20, '会一起等同一班车'],
      [0, '刚坐到同一张桌子'],
    ],
    school: [
      {
        id: 'homework',
        name: '一起写作业',
        detail: '两张桌子拼在一起。林舟算得慢，但会把过程写清楚。',
        closeness: 5,
        sat: 2,
        effects: { study: 2, stress: 1 },
      },
      {
        id: 'walk',
        name: '下课走走',
        detail: '从教学楼走到校门口再回来。多数时候不说话。',
        closeness: 8,
        sat: -1,
        effects: { mood: 4, stress: -4 },
      },
    ],
    weekend: [
      {
        id: 'weekend-lib',
        name: '周末去图书馆',
        detail: '占一张靠窗的桌子。两个小时几乎不说话。',
        need: WEEKEND_NEED,
        energy: 14,
        closeness: 10,
        sat: -4,
        sheet: { iq: 6, memory: 4 },
        effects: { study: 6, stress: 4 },
      },
      {
        id: 'weekend-home',
        name: '回家写作业',
        detail: '茶几上摊开练习册，晚饭多摆一双筷子。',
        need: WEEKEND_NEED,
        money: -8,
        closeness: 12,
        sat: -6,
        sheet: { eq: 5, memory: 4 },
        effects: { study: 4, mood: 3, stress: 5 },
      },
    ],
  },
  {
    id: 'gu-he',
    name: '顾河',
    title: '后座',
    glyph: '河',
    color: 0x2f7d57,
    line: '椅脚永远翘着。下课铃没响，人已经站起来。跑步从来不是最后。',
    words: [
      [75, '会把后座空出来等对方'],
      [45, '下课先回头问一句走不走'],
      [20, '对过一次答案，不算熟'],
      [0, '刚分到后一排'],
    ],
    school: [
      {
        id: 'answers',
        name: '课间对答案',
        detail: '他把本子斜过来。对得上打勾，对不上也不改。',
        closeness: 6,
        sat: 2,
        effects: { study: 2, mood: 1, stress: 2 },
      },
      {
        id: 'sprint',
        name: '一起冲下楼',
        detail: '楼梯口挤成一团。他跑在前面，到操场才停下来等。',
        closeness: 8,
        sat: -2,
        effects: { body: 4, mood: 3, stress: -5 },
      },
    ],
    weekend: [
      {
        id: 'weekend-field',
        name: '周末去操场',
        detail: '跑完两圈，坐在看台上传一瓶水。',
        need: WEEKEND_NEED,
        energy: 16,
        closeness: 11,
        sat: -6,
        sheet: { physique: 8 },
        effects: { body: 7, mood: 4, stress: -6 },
      },
    ],
  },
  {
    id: 'chen-mian',
    name: '陈勉',
    title: '值日搭子',
    glyph: '勉',
    color: 0xb8862b,
    line: '扫帚总是先到他手里。黑板字写得比老师还正，值日表从来没涂改过。',
    words: [
      [75, '值日表上两个人的名字并在一起'],
      [45, '会把抹布先拧干再递过来'],
      [20, '同组值日，下课点过头'],
      [0, '刚分到同一组'],
    ],
    school: [
      {
        id: 'duty',
        name: '一起值日',
        detail: '他擦黑板，{name}拖地。走廊空了才说话。',
        closeness: 6,
        sat: 3,
        effects: { mood: 2, stress: -2 },
      },
      {
        id: 'poster',
        name: '出板报',
        detail: '标题要写正。他管排版，剩的空格留给{name}画边。',
        closeness: 7,
        sat: 4,
        effects: { study: 1, mood: 3, stress: 2 },
      },
    ],
    weekend: [
      {
        id: 'weekend-keep',
        name: '周末守图书馆',
        detail: '还书车推完，两个人才在角落坐下看书。',
        need: WEEKEND_NEED,
        energy: 12,
        closeness: 10,
        sat: -5,
        sheet: { iq: 4, eq: 5, memory: 3 },
        effects: { study: 4, mood: 3, stress: 3 },
      },
    ],
  },
];

export const FRIEND = FRIENDS[0];
export const FRIEND_ACTIONS = FRIENDS[0].school;

export function getPal(id) {
  return FRIENDS.find((item) => item.id === id) || FRIENDS[0];
}

export function palActions(pal) {
  return [...(pal.school || []), ...(pal.weekend || [])];
}

export function findAction(actionId, palId) {
  const list = palId ? palActions(getPal(palId)) : FRIENDS.flatMap(palActions);
  return list.find((item) => item.id === actionId) || null;
}

export function palOwner(actionId) {
  return FRIENDS.find((pal) => palActions(pal).some((item) => item.id === actionId)) || FRIENDS[0];
}

export function emptyPals() {
  const pals = {};
  FRIENDS.forEach((pal) => {
    pals[pal.id] = { closeness: 0 };
  });
  return pals;
}

export function emptyFriend() {
  return {
    unlocked: false,
    actedThisRound: false,
    lastId: null,
    focusId: FRIENDS[0].id,
    pals: emptyPals(),
    id: FRIENDS[0].id,
    name: FRIENDS[0].name,
    closeness: 0,
  };
}

/** 旧存档只有林舟一条 closeness，读进来时补成三个人。 */
export function normalizeFriend(raw) {
  const base = emptyFriend();
  if (!raw) return base;
  const pals = emptyPals();
  FRIENDS.forEach((pal) => {
    pals[pal.id] = { closeness: Number(raw.pals?.[pal.id]?.closeness) || 0 };
  });
  if (!raw.pals && typeof raw.closeness === 'number') {
    pals[FRIENDS[0].id].closeness = raw.closeness;
  }
  const lastId = raw.lastId && pals[raw.lastId] ? raw.lastId : null;
  const focusId = raw.focusId && pals[raw.focusId] ? raw.focusId : (lastId || FRIENDS[0].id);
  const shown = getPal(lastId || FRIENDS[0].id);
  return {
    unlocked: Boolean(raw.unlocked),
    actedThisRound: Boolean(raw.actedThisRound),
    lastId,
    focusId,
    pals,
    id: FRIENDS[0].id,
    name: shown.name,
    closeness: pals[FRIENDS[0].id].closeness,
  };
}

export function closenessOf(state, palId) {
  const id = palId || state?.friend?.lastId || FRIENDS[0].id;
  return state?.friend?.pals?.[id]?.closeness
    ?? (id === FRIENDS[0].id ? (state?.friend?.closeness || 0) : 0);
}

export function palName(state, palId) {
  return getPal(palId || state?.friend?.lastId || FRIENDS[0].id).name;
}

export function closestPal(state) {
  let best = FRIENDS[0];
  let score = -1;
  FRIENDS.forEach((pal) => {
    const value = closenessOf(state, pal.id);
    if (value > score) {
      best = pal;
      score = value;
    }
  });
  return best;
}

export function closenessWord(pal, value) {
  const rows = pal?.words || FRIENDS[0].words;
  const hit = rows.find((row) => value >= row[0]);
  return hit ? hit[1] : rows[rows.length - 1][1];
}
