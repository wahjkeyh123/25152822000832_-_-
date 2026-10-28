/**
 * 文件：src/data/books.js
 * 作用：书店里的职业书。用积蓄买，买到后右侧「职业」标签页出现两项专属技能。
 * 书名都是本游戏自己编的，不对应真实出版物。
 */

export const BOOKS = [
  { id: 'book-scientist', career: 'scientist', name: '《把闹钟拆开以后》', price: 50 },
  { id: 'book-doctor', career: 'doctor', name: '《听诊器的另一头》', price: 60 },
  { id: 'book-writer', career: 'writer', name: '《然后呢》', price: 40 },
  { id: 'book-designer', career: 'designer', name: '《好看的一把椅子》', price: 45 },
  { id: 'book-athlete', career: 'athlete', name: '《最后一百米》', price: 35 },
  { id: 'book-host', career: 'host', name: '《对着镜子说话》', price: 35 },
  { id: 'book-lawyer', career: 'lawyer', name: '《先听对方说完》', price: 55 },
  { id: 'book-teacher', career: 'teacher', name: '《换个方法再讲一遍》', price: 30 },
];

export function getBook(id) {
  return BOOKS.find((book) => book.id === id) || null;
}

export function bookForCareer(careerId) {
  return BOOKS.find((book) => book.career === careerId) || null;
}
