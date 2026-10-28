/**
 * 文件：src/effects/FloatingText.js
 * 作用：属性变化时，在点击的位置飘出「智商+4」这样的字。
 * 先弹出放大，再上浮淡出。压力上升用红色，其他属性上升用绿色。
 */

import { STAT_LABEL, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';

const EXTRA_LABEL = { money: '积蓄', insight: '悟性', energy: '精力' };

function isGood(key, delta) {
  if (key === 'stress') return delta < 0;
  return delta > 0;
}

export function spawnStatChanges(scene, changes, x = 640, y = 420) {
  if (!changes) return;
  Object.keys(changes).forEach((key, index) => {
    const delta = changes[key];
    if (!delta) return;
    const name = STAT_LABEL[key] || SHEET_LABEL[key] || EXTRA_LABEL[key] || key;
    const label = `${name}${delta > 0 ? '+' : ''}${delta}`;
    const text = scene.add.text(x, y + index * 28, label, inkText(22, isGood(key, delta) ? '#2f7d57' : '#a33b32', {
      fontStyle: 'bold',
      stroke: '#fff8ee',
      strokeThickness: 5,
    })).setOrigin(0.5).setDepth(320).setScale(0.6).setAlpha(0);

    scene.tweens.add({
      targets: text,
      scale: 1,
      alpha: 1,
      duration: 160,
      delay: index * 70,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: text,
          y: text.y - 52,
          alpha: 0,
          duration: 900,
          delay: 260,
          ease: 'Quad.easeIn',
          onComplete: () => text.destroy(),
        });
      },
    });
  });
}
