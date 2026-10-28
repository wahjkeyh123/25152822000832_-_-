/**
 * 文件：src/data/items.js
 * 作用：商店里的四个道具。用了立刻生效，每个道具每回合限买一次。
 * 两个娱乐用品给孩子减压，两个让父母满意度上去。
 * - core：改学识 / 体质 / 心情 / 压力。
 * - sat：改父母满意度。
 * - sheet：改左边七项属性。
 */

export const ITEMS = [
  {
    id: 'console',
    name: '掌上游戏机',
    kind: 'fun',
    price: 35,
    core: { stress: -15, mood: 6 },
    sat: -3,
    detail: '玩一个下午，作业晚点再说。',
  },
  {
    id: 'park',
    name: '游乐园门票',
    kind: 'fun',
    price: 55,
    core: { stress: -28, mood: 10 },
    sheet: { charm: 2 },
    detail: '全家一起去，过山车排了好久。',
  },
  {
    id: 'workbook',
    name: '名校习题册',
    kind: 'parent',
    price: 40,
    sat: 16,
    core: { stress: 5 },
    sheet: { iq: 3 },
    detail: '封面印着「状元都在做」。',
  },
  {
    id: 'frame',
    name: '奖状相框',
    kind: 'parent',
    price: 30,
    sat: 12,
    sheet: { face: 2 },
    detail: '把那张奖状挂到客厅最显眼的地方。',
  },
];

export function getItem(id) {
  return ITEMS.find((item) => item.id === id) || null;
}
