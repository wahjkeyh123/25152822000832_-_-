/**
 * 文件：src/ui/TopBar.js
 * 作用：培养界面最上面一排。头像可点，打开个人信息。
 * 悟性、精力、积蓄只显示，不在这里扣。
 */

import { INSIGHT_ICON } from '../data/attributes.js';
import { getStage } from '../data/stages.js';
import { inkText } from '../config/constants.js';
import { faceFor } from '../systems/StatSystem.js';
import { paintIcon } from './paintIcon.js';
import TextButton from './components/TextButton.js';

export default class TopBar {
  constructor(scene, { onAvatar, onPause }) {
    this.scene = scene;
    scene.add.circle(58, 50, 30, 0xf3d7b0).setDepth(6);
    scene.add.circle(58, 50, 30).setStrokeStyle(3, 0xfff9f0, 1).setDepth(6);
    this.avatarFace = scene.add.text(58, 50, '', inkText(28)).setOrigin(0.5).setDepth(7);
    this.avatarImage = null;
    if (scene.textures.exists('avatar')) {
      this.avatarImage = scene.add.image(58, 50, 'avatar').setDepth(7);
      const longest = Math.max(this.avatarImage.width, this.avatarImage.height) || 1;
      this.avatarImage.setScale(54 / longest);
      const mask = scene.make.graphics({ add: false });
      mask.fillStyle(0xffffff);
      mask.fillCircle(58, 50, 27);
      this.avatarImage.setMask(mask.createGeometryMask());
      this.avatarFace.setVisible(false);
    }
    this.avatarHit = scene.add.circle(58, 50, 30, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(8);
    this.avatarHit.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      onAvatar();
    });

    this.nameText = scene.add.text(100, 34, '', inkText(22, '#2c2416')).setOrigin(0, 0.5).setDepth(6);
    this.stageText = scene.add.text(100, 64, '', inkText(15, '#6e6256')).setOrigin(0, 0.5).setDepth(6);

    paintIcon(scene, INSIGHT_ICON, 500, 48, 26, 6);
    this.insightText = scene.add.text(522, 48, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);
    this.energyText = scene.add.text(700, 48, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);
    this.moneyText = scene.add.text(900, 48, '', inkText(18)).setOrigin(0, 0.5).setDepth(6);

    this.pauseButton = new TextButton(scene, 1210, 48, 88, 40, '暂停', onPause, {
      fontSize: 16,
      depth: 6,
    });
  }

  refresh(state) {
    const stage = getStage(state.yearIndex);
    this.avatarFace.setText(faceFor(state.child.stats, stage));
    this.nameText.setText(state.child.name);
    this.stageText.setText(`${stage.grade} · ${stage.age} 岁`);
    this.insightText.setText(`悟性 ${state.household.insight}/${state.household.insightMax}`);
    this.energyText.setText(`精力 ${state.household.energy}/${state.household.energyMax}`);
    this.moneyText.setText(`积蓄 ${state.household.money}`);
    this.pauseButton.setVisible(!state.endingId);
  }
}
