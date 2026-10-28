/**
 * 文件：src/ui/components/TextButton.js
 * 作用：一块可以点击的圆角按钮。全游戏的按钮都用它，字号和手感才一致。
 * 外观是 Graphics 画的圆角块，点击靠上面一层透明矩形，避免容器带来的命中区域问题。
 * setEnabled(false) 之后点击无效，并换成灰色。按下会缩小一点再弹回。
 */

import { inkText } from '../../config/constants.js';
import { playClick } from '../../audio/AudioManager.js';
import { shade } from '../theme/frame.js';

const DISABLED = 0xc8b8a4;

export default class TextButton {
  constructor(scene, x, y, width, height, label, onClick, options = {}) {
    this.scene = scene;
    this.onClick = onClick;
    this.enabled = true;
    this.width = width;
    this.height = height;
    this.baseColor = options.color ?? 0xc45c26;
    this.hoverColor = options.hoverColor ?? 0xa84b1c;
    const depth = options.depth ?? 5;

    this.gfx = scene.add.graphics({ x, y }).setDepth(depth);
    this.paint(this.baseColor);
    this.text = scene.add.text(x, y - 1, label, inkText(options.fontSize ?? 18, '#fff8ee', {
      align: 'center',
      lineSpacing: 3,
      wordWrap: { width: Math.max(40, width - 16) },
    })).setOrigin(0.5).setDepth(depth + 1);
    this.bg = scene.add.rectangle(x, y, width, height, 0xffffff, 0.001)
      .setOrigin(0.5)
      .setDepth(depth + 1);

    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerover', () => {
      if (this.enabled) this.paint(this.hoverColor);
    });
    this.bg.on('pointerout', () => {
      if (this.enabled) this.paint(this.baseColor);
      this.press(false);
    });
    this.bg.on('pointerdown', () => {
      if (this.enabled) this.press(true);
    });
    this.bg.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.press(false);
      if (!this.enabled) return;
      playClick(scene);
      this.onClick();
    });
  }

  /** 以按钮中心为原点画：底下一层深色当厚度，上面一层本色，再加一道高光。 */
  paint(color) {
    const w = this.width;
    const h = this.height;
    const r = Math.min(14, h / 3);
    const g = this.gfx;
    g.clear();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, r);
    g.fillStyle(shade(color, 0.68), 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 1, r);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 3, r);
    g.fillStyle(0xffffff, 0.14);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, Math.max(4, (h - 3) * 0.38), Math.max(2, r - 3));
  }

  press(down) {
    const scale = down ? 0.95 : 1;
    this.scene.tweens.add({
      targets: [this.gfx, this.text],
      scale,
      duration: down ? 60 : 140,
      ease: down ? 'Quad.easeOut' : 'Back.easeOut',
    });
  }

  setLabel(label) {
    this.text.setText(label);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.paint(enabled ? this.baseColor : DISABLED);
    this.text.setColor(enabled ? '#fff8ee' : '#6e6256');
  }

  setVisible(visible) {
    this.gfx.setVisible(visible);
    this.text.setVisible(visible);
    this.bg.setVisible(visible);
    if (!visible) this.bg.disableInteractive();
    else this.bg.setInteractive({ useHandCursor: true });
  }

  getCenter() {
    return { x: this.bg.x, y: this.bg.y };
  }

  /** 弹窗销毁时，把按钮的显示对象交给面板一起清掉。 */
  nodes() {
    return [this.gfx, this.bg, this.text];
  }

  destroy() {
    this.gfx.destroy();
    this.bg.destroy();
    this.text.destroy();
  }
}
