/**
 * 文件：src/ui/EventPanel.js
 * 作用：弹出一件要做决定的事。选项上不写加减，结算时再按这步合不合适给结果。
 */

import { COLORS, inkText } from '../config/constants.js';
import { canChoose } from '../systems/EventSystem.js';
import { fillState, wrapChinese } from '../utils/text.js';
import BasePanel from './BasePanel.js';
import TextButton from './components/TextButton.js';

export default class EventPanel extends BasePanel {
  constructor(scene, event, state, onChoose) {
    const count = event.choices.length;
    const tall = count >= 3;
    super(scene, { title: event.title, width: 820, height: tall ? 540 : 460 });
    this.buttons = [];
    const body = wrapChinese(fillState(event.text, state, { pal: event.pal }), 26);
    this.track(
      scene.add.text(this.centerX, this.top + 100, body, inkText(22, COLORS.ink, {
        align: 'center',
        lineSpacing: 8,
      })).setOrigin(0.5, 0),
      4,
    );

    const btnH = tall ? 58 : 76;
    const gap = tall ? 68 : 88;
    const startY = this.top + (tall ? 236 : 250);
    event.choices.forEach((choice, index) => {
      const affordable = canChoose(state, choice);
      const label = affordable
        ? fillState(choice.text, state, { pal: event.pal })
        : `${fillState(choice.text, state, { pal: event.pal })}\n钱不够，选不了`;
      const button = new TextButton(
        scene,
        this.centerX,
        startY + index * gap,
        700,
        btnH,
        label,
        () => {
          if (!this.canClick() || !canChoose(state, choice)) return;
          onChoose(index);
        },
        { fontSize: 18, depth: 206, color: 0x5c4636, hoverColor: 0x3b2616 },
      );
      button.setEnabled(affordable);
      this.buttons.push(button);
      this.objects.push(...button.nodes());
    });
  }
}
