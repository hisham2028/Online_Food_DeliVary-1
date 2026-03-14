class EventBus {
  static #instance = null;
  #listeners = new Map();

  static getInstance() {
    if (!EventBus.#instance) EventBus.#instance = new EventBus();
    return EventBus.#instance;
  }

  /** Subscribe. Returns an unsubscribe function. */
  on(event, callback) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(callback);
    return () => this.#listeners.get(event)?.delete(callback);
  }

  /** Publish. */
  emit(event, payload) {
    this.#listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

/** Named event constants — prevents magic strings throughout the codebase. */
export const EVENTS = {
  FOOD_ADDED:            'food:added',
  FOOD_REMOVED:          'food:removed',
  ORDER_STATUS_CHANGED:  'order:statusChanged',
  SIDEBAR_TOGGLE:        'sidebar:toggle',
};

export default EventBus.getInstance();
