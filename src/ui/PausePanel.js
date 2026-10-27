/**
 * 文件：src/ui/PausePanel.js
 * 作用：暂停。继续会回到这一年；重开会丢掉当前进度；回主菜单会先存档。
 */

import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';

export default class PausePanel extends BasePanel {
  constructor(scene, { onResume, onRestart, onMenu }) {
    super(scene, { title: '暂停', width: 520, height: 420 });
    const items = [
      ['继续这一年', onResume, 0x2f7d57, 0x256746],
      ['重开一局', onRestart, 0xc45c26, 0xa84b1c],
      ['回主菜单', onMenu, 0x3d6ea8, 0x2f5684],
    ];
    items.forEach(([label, handler, color, hover], index) => {
      const button = new TextButton(
        scene,
        this.centerX,
        this.top + 130 + index * 84,
        360,
        64,
        label,
        () => {
          if (!this.canClick()) return;
          handler();
        },
        { fontSize: 22, depth: 206, color, hoverColor: hover },
      );
      this.objects.push(...button.nodes());
    });
  }
}
