/**
 * 文件：src/scenes/PreloadScene.js
 * 作用：加载页。现在没有外部图片和音效，所以只会短暂停留。
 * 以后把文件放进 assets/，在 preload() 里按注释加载，进度条会变成真的。
 */

import { COLORS, GAME_TITLE, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';
import { trimLoadedIcons } from '../ui/trimIcons.js';

export default class PreloadScene extends BaseScene {
  constructor() {
    super(SCENE.PRELOAD);
  }

  preload() {
    const sounds = import.meta.glob('../../assets/audio/*.{mp3,ogg,wav}', {
      eager: true,
      import: 'default',
    });
    Object.entries(sounds).forEach(([path, url]) => {
      const file = path.split(/[/\\]/).pop() || '';
      this.load.audio(file.replace(/\.\w+$/, ''), url);
    });
    const icons = import.meta.glob('../../assets/images/icons/*.{png,jpg,webp}', {
      eager: true,
      import: 'default',
    });
    Object.entries(icons).forEach(([path, url]) => {
      const file = path.split(/[/\\]/).pop() || '';
      const key = file.replace(/\.\w+$/, '');
      this.load.image(key, url);
    });

    this.bar = this.add.graphics();
    this.add.text(GAME_WIDTH / 2, 280, GAME_TITLE, inkText(48, COLORS.ink)).setOrigin(0.5);
    this.hint = this.add.text(GAME_WIDTH / 2, 360, '正在整理答卷…', inkText(20, COLORS.muted)).setOrigin(0.5);
    this.load.on('progress', (value) => this.drawBar(value));
  }

  create() {
    this.drawBar(1);
    trimLoadedIcons(this);
    this.hint.setText('可以开始了');
    this.time.delayedCall(280, () => this.scene.start(SCENE.MENU));
  }

  drawBar(value) {
    const width = 420;
    const x = GAME_WIDTH / 2 - width / 2;
    const y = 420;
    this.bar.clear();
    this.bar.fillStyle(0xe6d3ba, 1);
    this.bar.fillRoundedRect(x, y, width, 16, 8);
    this.bar.fillStyle(0xc45c26, 1);
    this.bar.fillRoundedRect(x, y, Math.max(16, width * value), 16, 8);
  }
}
