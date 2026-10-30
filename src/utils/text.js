/**
 * 文件：src/utils/text.js
 * 作用：中文没有空格，Phaser 默认不会自动换行。
 * 这里按字数切开，避免一句台词画出面板外面。
 *
 * 文案里用 {name} 代替孩子的名字，{ta} 代替「他 / 她」，{friend} 代替同学会的名字。
 * 写新文案时照这个写，不要把名字或性别写死。
 */

import { getPal, palName } from '../data/friends.js';

export function fillName(text, child, extra = {}) {
  const name = child?.name || '孩子';
  const ta = child?.gender === 'girl' ? '她' : '他';
  const friend = extra.friend || '林舟';
  const near = extra.near || '一条路';
  return String(text ?? '')
    .replace(/\{name\}/g, name)
    .replace(/\{ta\}/g, ta)
    .replace(/\{friend\}/g, friend)
    .replace(/\{near\}/g, near);
}

/** 按这一局的孩子和同学会，把文案里的占位符换掉。事件写了 pal 就用那个人。 */
export function fillState(text, state, extra = {}) {
  const friend = extra.friend || (extra.pal ? getPal(extra.pal).name : palName(state));
  return fillName(text, state?.child, { friend });
}

export function wrapChinese(text, maxChars) {
  const lines = [];
  const paragraphs = String(text).split('\n');
  paragraphs.forEach((paragraph) => {
    if (paragraph.length === 0) {
      lines.push('');
      return;
    }
    for (let index = 0; index < paragraph.length; index += maxChars) {
      lines.push(paragraph.slice(index, index + maxChars));
    }
  });
  return lines.join('\n');
}
