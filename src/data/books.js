/**
 * 文件：src/data/books.js
 * 作用：商店里的职业道具（初中才能买）。用积蓄买，买到后右侧「职业」标签页出现职业技能线。
 * 店里摆的是实物教具，不是书皮。存档仍用原来的 id，避免读档对不上。
 */

export const BOOKS = [
  { id: 'book-scientist', career: 'scientist', name: '编程机器人套件', price: 50, icon: 'shop-coder' },
  { id: 'book-doctor', career: 'doctor', name: '小小医生工具箱', price: 60, icon: 'shop-doctor' },
  { id: 'book-writer', career: 'writer', name: '《然后呢》', price: 40 },
  { id: 'book-designer', career: 'designer', name: '建筑师蓝图套装', price: 45, icon: 'shop-architect' },
  { id: 'book-athlete', career: 'athlete', name: '《最后一百米》', price: 35 },
  { id: 'book-host', career: 'host', name: '表演剧本卡', price: 35, icon: 'shop-actor' },
  { id: 'book-lawyer', career: 'lawyer', name: '模拟法庭套装', price: 55, icon: 'shop-lawyer' },
  { id: 'book-teacher', career: 'teacher', name: '小小老师教具盒', price: 30, icon: 'shop-teacher' },
];

export function getBook(id) {
  return BOOKS.find((book) => book.id === id) || null;
}

export function bookForCareer(careerId) {
  return BOOKS.find((book) => book.career === careerId) || null;
}
