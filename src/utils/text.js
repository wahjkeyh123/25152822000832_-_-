/**
 * 文件：src/utils/text.js
 * 作用：中文没有空格，Phaser 默认不会自动换行。
 * 这里按字数切开，避免一句台词画出面板外面。
 */

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
