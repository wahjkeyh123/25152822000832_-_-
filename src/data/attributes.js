/**
 * 文件：src/data/attributes.js
 * 作用：培养界面左边那七项属性，以及悟性图标的占位说明。
 * 图形是临时的。把同名 png 放进 assets/images/icons/ 后，画面会改用你的图。
 */

export const SHEET_KEYS = ['iq', 'eq', 'imagination', 'memory', 'physique', 'charm', 'face'];

export const ATTRIBUTES = [
  { key: 'iq', label: '智商', shape: 'triangle', color: 0x3d9a4a },
  { key: 'eq', label: '情商', shape: 'circle', color: 0xd64545 },
  { key: 'imagination', label: '想象力', shape: 'square', color: 0xf08ab4 },
  { key: 'memory', label: '记忆力', shape: 'diamond', color: 0xe2b325 },
  { key: 'physique', label: '体魄', shape: 'drop', color: 0x3aa0e0 },
  { key: 'charm', label: '魅力', shape: 'star', color: 0x8d4ad8 },
  { key: 'face', label: '面子', shape: 'fan', color: 0xf08a2a },
];

export const INSIGHT_ICON = { key: 'insight', label: '悟性', shape: 'bulb', color: 0xe2a325 };

/** 压力太大时脑洞里出现的乌云。放一张 cloud.png 进 icons 文件夹就会换成图片。 */
export const CLOUD_ICON = { key: 'cloud', label: '乌云', shape: 'cloud', color: 0x8a8f99 };

export const SHEET_LABEL = Object.fromEntries(ATTRIBUTES.map((item) => [item.key, item.label]));

/** 新的一局，左边面板从这里开始。面子先是 0，其他几项故意错开，避免七个都一样。 */
export const START_SHEET = {
  iq: 11,
  eq: 13,
  imagination: 9,
  memory: 12,
  physique: 14,
  charm: 8,
  face: 0,
};

/** 每个时期结束时加上的数，面板右侧的「+N/回合」就是它。 */
export const START_GROWTH = {
  iq: 2,
  eq: 2,
  imagination: 2,
  memory: 2,
  physique: 2,
  charm: 1,
  face: 1,
};

export function attributeByKey(key) {
  if (key === CLOUD_ICON.key) return CLOUD_ICON;
  return ATTRIBUTES.find((item) => item.key === key) || INSIGHT_ICON;
}

/** 旧存档没有这七项时，用原来的四项属性估一个能看的面板。 */
export function sheetFromCore(stats = {}) {
  const study = stats.study ?? 0;
  const body = stats.body ?? 0;
  const mood = stats.mood ?? 0;
  const stress = stats.stress ?? 0;
  return {
    iq: study,
    eq: Math.round((mood + (100 - stress)) / 2),
    imagination: Math.round(mood * 0.7),
    memory: Math.round(study * 0.85),
    physique: body,
    charm: Math.round((mood + body) / 2),
    face: Math.max(0, Math.round((mood - stress) / 2)),
  };
}
