/**
 * 文件：src/ui/theme/frame.js
 * 作用：全游戏共用的「木框 + 纸面」画法。所有面板都从这里取颜色和形状，换风格只改这一个文件。
 * 这些函数只往传进来的 Graphics 上画，不创建对象，也不管层级。
 */

export const WOOD = {
  dark: 0x4f3220,
  mid: 0x7d5234,
  light: 0xa8754a,
  grain: 0x3d2617,
};

export const PAPER = {
  face: 0xfff6e6,
  band: 0xf6ead4,
  edge: 0xdcc6a2,
  ink: 0x5b4632,
};

/** 把颜色按比例调暗（factor < 1）或调亮（factor > 1）。 */
export function shade(color, factor) {
  const r = Math.min(255, Math.round(((color >> 16) & 0xff) * factor));
  const g = Math.min(255, Math.round(((color >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.round((color & 0xff) * factor));
  return (r << 16) | (g << 8) | b;
}

export function drawShadow(g, x, y, w, h, radius = 16, alpha = 0.22) {
  g.fillStyle(0x000000, alpha);
  g.fillRoundedRect(x + 5, y + 9, w, h, radius);
}

/** 米色纸面：底色、两条淡横纹、细描边。 */
export function drawPaper(g, x, y, w, h, radius = 12) {
  g.fillStyle(PAPER.face, 1);
  g.fillRoundedRect(x, y, w, h, radius);
  g.fillStyle(PAPER.band, 0.7);
  g.fillRect(x + 10, y + h * 0.33, w - 20, 2);
  g.fillRect(x + 10, y + h * 0.66, w - 20, 2);
  g.lineStyle(2, PAPER.edge, 1);
  g.strokeRoundedRect(x, y, w, h, radius);
}

/** 深棕外框、浅棕内框、木纹，中间铺纸。border 是木框的宽度。 */
export function drawWoodFrame(g, x, y, w, h, { radius = 20, border = 12, shadow = true } = {}) {
  if (shadow) drawShadow(g, x, y, w, h, radius);
  g.fillStyle(WOOD.dark, 1);
  g.fillRoundedRect(x, y, w, h, radius);
  g.fillStyle(WOOD.mid, 1);
  g.fillRoundedRect(x + 3, y + 3, w - 6, h - 6, radius - 2);
  g.lineStyle(1, WOOD.grain, 0.35);
  for (let line = 0; line < 3; line += 1) {
    const offset = 4 + line * 3;
    g.lineBetween(x + radius, y + offset, x + w - radius, y + offset);
    g.lineBetween(x + radius, y + h - offset, x + w - radius, y + h - offset);
  }
  g.lineStyle(2, WOOD.light, 0.6);
  g.strokeRoundedRect(x + border - 4, y + border - 4, w - (border - 4) * 2, h - (border - 4) * 2, radius - 6);
  drawPaper(g, x + border, y + border, w - border * 2, h - border * 2, Math.max(6, radius - 8));
}

/** 一张小卡片：投影 + 纸面，不带木框。属性栏、技能卡用它。 */
export function drawCard(g, x, y, w, h, radius = 14) {
  drawShadow(g, x, y, w, h, radius, 0.14);
  drawPaper(g, x, y, w, h, radius);
}

/** 标签页：一块带深色底边的彩色圆角条，像夹在纸上的书签。 */
export function drawTab(g, x, y, w, h, color = 0xc45c26) {
  g.fillStyle(shade(color, 0.7), 1);
  g.fillRoundedRect(x, y + 3, w, h, 10);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x, y, w, h, 10);
  g.fillStyle(0xffffff, 0.16);
  g.fillRoundedRect(x + 4, y + 3, w - 8, h * 0.4, 6);
}
