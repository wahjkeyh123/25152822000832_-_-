/**
 * 文件：src/core/EventBus.js
 * 作用：一个传话的桌子。
 * 场景算完属性后喊一声「状态变了」，顶栏、按钮各自刷新。
 * 这样界面文件不用互相 import，以后加新界面只要来听这一声。
 */

export default class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  /** 订阅。返回一个函数，调用它就取消订阅。场景关闭时一定要取消，不然会收到旧场景的消息。 */
  on(name, handler) {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }
    this.handlers.get(name).add(handler);
    return () => this.off(name, handler);
  }

  off(name, handler) {
    const set = this.handlers.get(name);
    if (set) set.delete(handler);
  }

  emit(name, payload) {
    const set = this.handlers.get(name);
    if (!set) return;
    [...set].forEach((handler) => handler(payload));
  }
}
