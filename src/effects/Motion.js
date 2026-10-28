/**
 * 文件：src/effects/Motion.js
 * 作用：全游戏的小动效。呼吸、弹跳、淡入都在这里，别的文件只调用，不自己写补间。
 * 时长都很短，不会挡住玩家点下一步。
 */

/** 让一张图轻轻呼吸：纵向放大 2.5%，来回循环。返回补间，换图时要先 stop。 */
export function breathe(scene, target) {
  const baseX = target.scaleX;
  const baseY = target.scaleY;
  return scene.tweens.add({
    targets: target,
    scaleY: baseY * 1.025,
    scaleX: baseX * 0.995,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

/** 被点了一下：往上跳 14 像素再落回。 */
export function hop(scene, targets, height = 14) {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  list.forEach((target) => {
    if (target.__hopping) return;
    target.__hopping = true;
    const baseY = target.y;
    scene.tweens.add({
      targets: target,
      y: baseY - height,
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        target.y = baseY;
        target.__hopping = false;
      },
    });
  });
}

/** 弹窗打开：所有对象从透明淡到原来的透明度。原来就几乎透明的点击层不动。 */
export function fadeInObjects(scene, objects, duration = 160) {
  objects.forEach((obj) => {
    if (!obj || !obj.scene || typeof obj.setAlpha !== 'function') return;
    const target = obj.alpha;
    if (typeof target !== 'number' || target < 0.05) return;
    obj.setAlpha(0);
    scene.tweens.add({ targets: obj, alpha: target, duration, ease: 'Quad.easeOut' });
  });
}

/** 换背景：新图淡入，旧图淡出后销毁。 */
export function crossFade(scene, from, to, duration = 420) {
  if (to) {
    to.setAlpha(0);
    scene.tweens.add({ targets: to, alpha: 1, duration, ease: 'Sine.easeInOut' });
  }
  if (from) {
    scene.tweens.add({
      targets: from,
      alpha: 0,
      duration,
      ease: 'Sine.easeInOut',
      onComplete: () => from.destroy(),
    });
  }
}

/** 数字跳一下：先放大到 1.25 倍再回来，用在属性值变化的时候。 */
export function pulse(scene, target) {
  if (!target || target.__pulsing) return;
  target.__pulsing = true;
  scene.tweens.add({
    targets: target,
    scale: 1.25,
    duration: 110,
    yoyo: true,
    ease: 'Quad.easeOut',
    onComplete: () => {
      target.setScale(1);
      target.__pulsing = false;
    },
  });
}
