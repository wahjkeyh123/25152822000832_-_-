/**
 * 文件：src/data/aspirations.js
 * 作用：初中开头问一次方向，高中开头在这个方向里问一次具体职业。
 * 选中后，keys 里的两项属性每回合成长 +1。书店里同方向的书打八折。
 */

export const DIRECTIONS = [
  {
    id: 'science',
    label: '理科',
    blurb: '总想把东西拆开，看看里面怎么转。',
    keys: ['iq', 'memory'],
  },
  {
    id: 'arts',
    label: '文艺',
    blurb: '脑子里有画面，也有讲不完的故事。',
    keys: ['imagination', 'eq'],
  },
  {
    id: 'stage',
    label: '运动与舞台',
    blurb: '坐不住，站到人前反而自在。',
    keys: ['physique', 'charm'],
  },
  {
    id: 'people',
    label: '和人打交道',
    blurb: '谁吵架了，他总是先去劝的那个。',
    keys: ['eq', 'face'],
  },
];

export const BOOK_DISCOUNT = 0.8;

export function getDirection(id) {
  return DIRECTIONS.find((item) => item.id === id) || null;
}
