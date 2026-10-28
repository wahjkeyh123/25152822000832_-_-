/**
 * 文件：src/ui/trimIcons.js
 * 作用：图标原图四周是白边。这里从边缘把近白的底去掉，只留下图形本身。
 * 角落里单独的浅色水印会比主体小，一并丢掉。这样 22 像素的格子里也能看清。
 * 孩子立绘走另一条路（cutoutChildren），只去背景，不丢小块，免得把手里的蜡笔也去掉。
 */

const KEYS = ['iq', 'eq', 'imagination', 'memory', 'physique', 'charm', 'face', 'insight'];

export function trimLoadedIcons(scene) {
  KEYS.forEach((key) => {
    if (scene.textures.exists(key)) trimTexture(scene, key);
  });
}

/**
 * 孩子立绘是白底 jpg。jpg 的白不是纯白，所以放宽一点：亮且几乎没有颜色的都算底。
 * 去底后给边缘一圈半透明，贴到房间背景上不会有白边。
 */
export function cutoutChildren(scene) {
  scene.textures.getTextureKeys()
    .filter((key) => key.startsWith('child-'))
    .forEach((key) => {
      const source = scene.textures.get(key).getSourceImage();
      if (!source) return;
      const scale = Math.min(1, 900 / Math.max(source.width, source.height));
      const width = Math.max(1, Math.round(source.width * scale));
      const height = Math.max(1, Math.round(source.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(source, 0, 0, width, height);
      const image = context.getImageData(0, 0, width, height);
      const cropped = cutout(image);
      if (!cropped) return;
      scene.textures.remove(key);
      scene.textures.addCanvas(key, cropped);
    });
}

function isPaper(data, offset) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  return Math.min(r, g, b) >= 232 && Math.max(r, g, b) - Math.min(r, g, b) <= 16;
}

function cutout(image) {
  const { data, width, height } = image;
  const clear = new Uint8Array(width * height);
  const stack = [];
  const consider = (index) => {
    if (clear[index] || !isPaper(data, index * 4)) return;
    clear[index] = 1;
    stack.push(index);
  };
  for (let x = 0; x < width; x += 1) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    consider(y * width);
    consider(y * width + width - 1);
  }
  while (stack.length) {
    const index = stack.pop();
    const x = index % width;
    if (x > 0) consider(index - 1);
    if (x < width - 1) consider(index + 1);
    if (index >= width) consider(index - width);
    if (index < width * (height - 1)) consider(index + width);
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let index = 0; index < clear.length; index += 1) {
    const pixel = index * 4;
    if (clear[index]) {
      data[pixel + 3] = 0;
      continue;
    }
    const x = index % width;
    const y = (index / width) | 0;
    const edge = (x > 0 && clear[index - 1]) || (x < width - 1 && clear[index + 1])
      || (index >= width && clear[index - width]) || (index < width * (height - 1) && clear[index + width]);
    if (edge) data[pixel + 3] = 150;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (maxX <= minX || maxY <= minY) return null;
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').putImageData(image, -minX, -minY);
  return out;
}

function trimTexture(scene, key) {
  const source = scene.textures.get(key).getSourceImage();
  if (!source) return;
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(source, 0, 0, width, height);
  const image = context.getImageData(0, 0, width, height);
  const cropped = cropContent(image);
  if (!cropped) return;
  scene.textures.remove(key);
  scene.textures.addCanvas(key, cropped);
}

function cropContent(image) {
  const { data, width, height } = image;
  const seen = new Uint8Array(width * height);
  const stack = [];
  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index] || !isBackdrop(data, index * 4)) return;
    seen[index] = 1;
    stack.push(index);
  };
  for (let x = 0; x < width; x += 1) {
    consider(x, 0);
    consider(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    consider(0, y);
    consider(width - 1, y);
  }
  while (stack.length) {
    const index = stack.pop();
    const x = index % width;
    const y = (index / width) | 0;
    data[index * 4 + 3] = 0;
    consider(x - 1, y);
    consider(x + 1, y);
    consider(x, y - 1);
    consider(x, y + 1);
  }

  const owner = new Int32Array(width * height);
  owner.fill(-1);
  let bestId = -1;
  let bestCount = 0;
  let nextId = 0;
  for (let start = 0; start < owner.length; start += 1) {
    if (owner[start] !== -1 || data[start * 4 + 3] === 0) continue;
    const id = nextId;
    nextId += 1;
    let count = 0;
    const queue = [start];
    owner[start] = id;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const index = queue[cursor];
      count += 1;
      const x = index % width;
      const y = (index / width) | 0;
      const neighbors = [index - 1, index + 1, index - width, index + width];
      neighbors.forEach((next) => {
        if (next < 0 || next >= owner.length || owner[next] !== -1 || data[next * 4 + 3] === 0) return;
        const nx = next % width;
        if (Math.abs(nx - x) > 1) return;
        owner[next] = id;
        queue.push(next);
      });
    }
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  if (bestId < 0) return null;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let index = 0; index < owner.length; index += 1) {
    const pixel = index * 4;
    if (owner[index] !== bestId) {
      data[pixel + 3] = 0;
      continue;
    }
    const x = index % width;
    const y = (index / width) | 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cropW;
  out.height = cropH;
  out.getContext('2d').putImageData(image, -minX, -minY);
  return out;
}

function isBackdrop(data, offset) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];
  if (alpha < 16) return true;
  return red >= 246 && green >= 246 && blue >= 246;
}
