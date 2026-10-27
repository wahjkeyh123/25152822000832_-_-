/**
 * 文件：src/ui/components/TextButton.js
 * 作用：一块可以点击的色块按钮。全游戏的按钮都用它，字号和手感才一致。
 * 按钮不用容器包起来，避免 Phaser 里「点得着但点不中」的命中区域问题。
 * setEnabled(false) 之后点击无效，并换成灰色。
 */

import { inkText } from '../../config/constants.js';
import { playClick } from '../../audio/AudioManager.js';

export default class TextButton {
  constructor(scene, x, y, width, height, label, onClick, options = {}) {
    this.scene = scene;
    this.onClick = onClick;
    this.enabled = true;
    this.baseColor = options.color ?? 0xc45c26;
    this.hoverColor = options.hoverColor ?? 0xa84b1c;
    const depth = options.depth ?? 5;
    this.bg = scene.add.rectangle(x, y, width, height, this.baseColor, 1)
      .setOrigin(0.5)
      .setDepth(depth);
    this.bg.setStrokeStyle(2, 0x8a4120, 0.25);
    this.text = scene.add.text(x, y, label, inkText(options.fontSize ?? 18, '#fff8ee', {
      align: 'center',
      lineSpacing: 3,
      wordWrap: { width: Math.max(40, width - 16) },
    })).setOrigin(0.5).setDepth(depth + 1);

    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerover', () => {
      if (this.enabled) this.bg.setFillStyle(this.hoverColor);
    });
    this.bg.on('pointerout', () => {
      if (this.enabled) this.bg.setFillStyle(this.baseColor);
    });
    this.bg.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (!this.enabled) return;
      playClick(scene);
      this.onClick();
    });
  }

  setLabel(label) {
    this.text.setText(label);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.bg.setFillStyle(enabled ? this.baseColor : 0xc8b8a4);
    this.text.setColor(enabled ? '#fff8ee' : '#6e6256');
  }

  setVisible(visible) {
    this.bg.setVisible(visible);
    this.text.setVisible(visible);
    if (!visible) this.bg.disableInteractive();
    else this.bg.setInteractive({ useHandCursor: true });
  }

  getCenter() {
    return { x: this.bg.x, y: this.bg.y };
  }

  /** 弹窗销毁时，把按钮的两块显示对象交给面板一起清掉。 */
  nodes() {
    return [this.bg, this.text];
  }

  destroy() {
    this.bg.destroy();
    this.text.destroy();
  }
}
