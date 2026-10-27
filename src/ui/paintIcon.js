/**
 * 文件：src/ui/paintIcon.js
 * 作用：画出一项属性的图标。
 * assets/images/icons/ 里如果已经有同名图片，就用图片，不再画几何图形。
 */

import Phaser from 'phaser';

export function paintIcon(scene, icon, x, y, size, depth = 6) {
  if (scene.textures.exists(icon.key)) {
    const image = scene.add.image(x, y, icon.key).setDepth(depth);
    const longest = Math.max(image.width, image.height) || 1;
    image.setScale(size / longest);
    return image;
  }
  const g = scene.add.graphics().setDepth(depth);
  drawShape(g, icon.shape, icon.color, x, y, size);
  return g;
}

function drawShape(g, shape, color, x, y, size) {
  const r = size / 2;
  g.fillStyle(color, 1);
  if (shape === 'triangle') {
    g.fillTriangle(x, y - r, x - r, y + r * 0.8, x + r, y + r * 0.8);
    return;
  }
  if (shape === 'circle' || shape === 'bulb') {
    g.fillCircle(x, y - (shape === 'bulb' ? 2 : 0), r * (shape === 'bulb' ? 0.72 : 1));
    if (shape === 'bulb') {
      g.fillRoundedRect(x - r * 0.22, y + r * 0.45, r * 0.44, r * 0.36, 2);
    }
    return;
  }
  if (shape === 'square') {
    g.fillRoundedRect(x - r, y - r, size, size, 4);
    return;
  }
  if (shape === 'diamond') {
    g.fillPoints([
      new Phaser.Math.Vector2(x, y - r),
      new Phaser.Math.Vector2(x + r, y),
      new Phaser.Math.Vector2(x, y + r),
      new Phaser.Math.Vector2(x - r, y),
    ], true);
    return;
  }
  if (shape === 'drop') {
    g.fillCircle(x, y + r * 0.15, r * 0.72);
    g.fillTriangle(x, y - r, x - r * 0.55, y + r * 0.1, x + r * 0.55, y + r * 0.1);
    return;
  }
  if (shape === 'star') {
    const points = [];
    for (let index = 0; index < 8; index += 1) {
      const radius = index % 2 === 0 ? r : r * 0.42;
      const angle = -Math.PI / 2 + (index * Math.PI) / 4;
      points.push(new Phaser.Math.Vector2(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
    }
    g.fillPoints(points, true);
    return;
  }
  if (shape === 'fan') {
    g.slice(x, y + r * 0.2, r, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.fillPath();
  }
}
