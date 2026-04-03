export const ORDER_STATUSES = {
  FOOD_PROCESSING: 'Food Processing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export const FOOD_CATEGORIES = [
  'Salad',
  'Rolls',
  'Deserts',
  'Sandwich',
  'Cake',
  'Pure Veg',
  'Pasta',
  'Noodles',
];

export class OrderItem {
  constructor(raw = {}) {
    this.name = raw.name ?? '';
    this.quantity = raw.quantity ?? 0;
  }

  toString() {
    return `${this.name} x ${this.quantity}`;
  }
}

export class Address {
  constructor(raw = {}) {
    this.firstName = raw.firstName ?? '';
    this.lastName = raw.lastName ?? '';
    this.street = raw.street ?? '';
    this.city = raw.city ?? '';
    this.state = raw.state ?? '';
    this.country = raw.country ?? '';
    this.zipcode = raw.zipcode ?? '';
    this.phone = raw.phone ?? '';
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get cityLine() {
    const parts = [this.city, this.state, this.country].filter(Boolean);
    const left = parts.join(', ');
    if (!this.zipcode) return left;
    if (!left) return this.zipcode;
    return `${left} ${this.zipcode}`;
  }

  get singleLine() {
    return [this.street, this.cityLine].filter(Boolean).join(', ');
  }
}

export class Order {
  constructor(raw = {}) {
    this._id = raw._id ?? '';
    this.amount = Number(raw.amount ?? 0);
    this.status = raw.status ?? ORDER_STATUSES.FOOD_PROCESSING;
    this.date = raw.date ?? null;
    this.items = (raw.items ?? []).map((item) => new OrderItem(item));
    this.address = new Address(raw.address ?? {});
  }

  get shortId() {
    return `#${String(this._id).slice(-6).toUpperCase()}`;
  }

  get formattedAmount() {
    return `$${this.amount.toFixed(2)}`;
  }

  get formattedDate() {
    if (!this.date) return '—';
    const d = new Date(this.date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  }

  get itemSummary() {
    return this.items.map((item) => item.toString()).join(', ');
  }

  get statusClass() {
    return this.status.toLowerCase().replace(/\s+/g, '-');
  }

  isWithin(period) {
    if (period === 'all') return true;
    if (!this.date) return false;

    const d = new Date(this.date);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfOrderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (period === 'day') {
      return startOfOrderDay.getTime() === startOfToday.getTime();
    }

    if (period === 'week') {
      const diffMs = startOfToday.getTime() - startOfOrderDay.getTime();
      const diffDays = diffMs / 86400000;
      return diffDays >= 0 && diffDays < 7;
    }

    if (period === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }

    if (period === 'year') {
      return d.getFullYear() === now.getFullYear();
    }

    return true;
  }
}

export class FoodItem {
  constructor(raw = {}) {
    this._id = raw._id ?? '';
    this.name = raw.name ?? '';
    this.description = raw.description ?? '';
    this.price = Number(raw.price ?? 0);
    this.category = raw.category ?? '';
    const image = raw.image ?? '';
    this.image = image && !/^https?:\/\//.test(image)
      ? `http://localhost:4002/images/${image.replace(/^\/+/, '')}`
      : image;
  }

  get formattedPrice() {
    return `$${this.price.toFixed(2)}`;
  }
}

export class DashboardStats {
  constructor(orders = []) {
    this.totalOrders = orders.length;
    this.totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0);
    this.foodProcessing = orders.filter((o) => o.status === ORDER_STATUSES.FOOD_PROCESSING).length;
    this.outForDelivery = orders.filter((o) => o.status === ORDER_STATUSES.OUT_FOR_DELIVERY).length;
    this.delivered = orders.filter((o) => o.status === ORDER_STATUSES.DELIVERED).length;
  }

  get formattedRevenue() {
    return `$${this.totalRevenue.toFixed(2)}`;
  }
}
