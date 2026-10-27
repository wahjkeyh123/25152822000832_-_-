/**
 * 文件：src/audio/AudioManager.js
 * 作用：统一播放音效。现在仓库里没有音频文件，所以点击是安静的，也不会报错。
 *
 * 以后要加点击声：
 * 1. 把 mp3 放到 assets/audio/click.mp3
 * 2. 打开 src/scenes/PreloadScene.js，按里面的注释加载，键名写成 click
 * 3. 不用改这个文件
 */

const CLICK_KEY = 'click';

export function playClick(scene) {
  if (!scene.cache || !scene.cache.audio || !scene.cache.audio.exists(CLICK_KEY)) return;
  scene.sound.play(CLICK_KEY);
}
