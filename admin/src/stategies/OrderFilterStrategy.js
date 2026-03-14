/**
 * OrderFilterStrategy — Strategy Pattern
 *
 * Each time period is an independent, interchangeable strategy.
 * Adding a new period = one new class, zero changes elsewhere.
 * Follows the Open/Closed Principle.
 */

class AllTimeStrategy {
  get key()   { return 'all'; }
  get label() { return 'All Time'; }
  apply(orders) { return orders; }
}

class TodayStrategy {
  get key()   { return 'day'; }
  get label() { return 'Today'; }
  apply(orders) { return orders.filter((o) => o.isWithin('day')); }
}

class WeekStrategy {
  get key()   { return 'week'; }
  get label() { return 'This Week'; }
  apply(orders) { return orders.filter((o) => o.isWithin('week')); }
}

class MonthStrategy {
  get key()   { return 'month'; }
  get label() { return 'This Month'; }
  apply(orders) { return orders.filter((o) => o.isWithin('month')); }
}

class YearStrategy {
  get key()   { return 'year'; }
  get label() { return 'This Year'; }
  apply(orders) { return orders.filter((o) => o.isWithin('year')); }
}

/**
 * OrderFilterContext
 * Acts as the context that holds and executes strategies.
 * Static API keeps usage clean: OrderFilterContext.filter(orders, 'week')
 */
export class OrderFilterContext {
  static #all = [
    new AllTimeStrategy(),
    new TodayStrategy(),
    new WeekStrategy(),
    new MonthStrategy(),
    new YearStrategy(),
  ];

  static getAll()        { return OrderFilterContext.#all; }

  static getByKey(key) {
    return OrderFilterContext.#all.find((s) => s.key === key)
        ?? OrderFilterContext.#all[0];
  }

  static filter(orders, key) {
    return OrderFilterContext.getByKey(key).apply(orders);
  }
}
