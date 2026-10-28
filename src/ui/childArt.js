/**
 * 文件：src/ui/childArt.js
 * 作用：找到「这个性别、这个时期」的孩子立绘，并能裁出头像。
 * 图片放在 assets/images/child/，文件名是 性别-时期，例如 girl-middle.jpg。
 * 缺图时返回 null，调用方自己画占位。
 */

/** 头在整张立绘里大约占多高。婴儿是坐姿，头最大。 */
const HEAD_RATIO = { baby: 0.42, kinder: 0.26, middle: 0.17, high: 0.16 };

export function childArtKey(scene, child, stageId) {
  const key = `child-${child?.gender === 'girl' ? 'girl' : 'boy'}-${stageId}`;
  return scene.textures.exists(key) ? key : null;
}

/**
 * 在 (x, y) 画一个半径 radius 的圆形头像。返回 [底圈, 头像图] 两个对象，方便面板统一销毁。
 * 没有立绘时只画底圈。
 */
export function addPortrait(scene, child, stageId, x, y, radius, depth = 6) {
  const ring = scene.add.circle(x, y, radius, 0xf3d7b0).setStrokeStyle(3, 0xf3d48a, 1).setDepth(depth);
  const key = childArtKey(scene, child, stageId);
  if (!key) return [ring];
  const image = scene.add.image(x, y, key).setOrigin(0.5, 0).setDepth(depth + 1);
  fitHead(image, stageId, x, y, radius);
  const mask = scene.make.graphics({ add: false });
  mask.fillStyle(0xffffff);
  mask.fillCircle(x, y, radius - 2);
  image.setMask(mask.createGeometryMask());
  return [ring, image];
}

/** 换时期或换性别时，把已有头像换成新图。 */
export function swapPortrait(scene, image, child, stageId, x, y, radius) {
  const key = childArtKey(scene, child, stageId);
  if (!image || !key) return;
  image.setTexture(key);
  fitHead(image, stageId, x, y, radius);
}

function fitHead(image, stageId, x, y, radius) {
  const head = image.height * (HEAD_RATIO[stageId] || 0.2);
  const scale = (radius * 2.1) / Math.max(1, head);
  image.setScale(scale);
  image.setPosition(x, y - head * scale * 0.5);
}
