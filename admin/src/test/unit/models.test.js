/**
 * UNIT TEST — Admin Domain Models
 * Tests: OrderItem, Address, Order, FoodItem, DashboardStats
 */
import { describe, test, expect } from 'vitest';
import {
  OrderItem, Address, Order, FoodItem, DashboardStats,
  ORDER_STATUSES, FOOD_CATEGORIES,
} from '../../models/index.js';

describe('OrderItem', () => {
  test('stores name and quantity', () => {
    const item = new OrderItem({ name: 'Pizza', quantity: 2 });
    expect(item.name).toBe('Pizza');
    expect(item.quantity).toBe(2);
  });

  test('toString returns "name x quantity"', () => {
    const item = new OrderItem({ name: 'Burger', quantity: 3 });
    expect(item.toString()).toBe('Burger x 3');
  });
});

describe('Address', () => {
  const data = {
    firstName: 'John', lastName: 'Doe', street: '123 Main St',
    city: 'NYC', state: 'NY', country: 'US', zipcode: '10001', phone: '555-1234',
  };

  test('fullName combines first and last name', () => {
    expect(new Address(data).fullName).toBe('John Doe');
  });

  test('fullName trims when lastName is empty', () => {
    expect(new Address({ firstName: 'John' }).fullName).toBe('John');
  });

  test('cityLine formats city, state, country, zip', () => {
    expect(new Address(data).cityLine).toBe('NYC, NY, US 10001');
  });

  test('singleLine combines street and cityLine', () => {
    expect(new Address(data).singleLine).toContain('123 Main St');
    expect(new Address(data).singleLine).toContain('NYC');
  });

  test('defaults all fields to empty strings', () => {
    const addr = new Address();
    expect(addr.firstName).toBe('');
    expect(addr.street).toBe('');
  });
});

describe('Order', () => {
  const rawOrder = {
    _id: 'abc123def456',
    amount: 25.5,
    status: 'Food Processing',
    date: '2026-03-11T10:00:00Z',
    items: [{ name: 'Pizza', quantity: 2 }],
    address: { firstName: 'John', city: 'NYC' },
  };

  test('parses raw data into typed fields', () => {
    const order = new Order(rawOrder);
    expect(order.amount).toBe(25.5);
    expect(order.status).toBe('Food Processing');
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toBeInstanceOf(OrderItem);
    expect(order.address).toBeInstanceOf(Address);
  });

  test('shortId returns last 6 chars uppercased with #', () => {
    const order = new Order(rawOrder);
    expect(order.shortId).toBe('#DEF456');
  });

  test('formattedAmount returns dollar format', () => {
    const order = new Order(rawOrder);
    expect(order.formattedAmount).toBe('$25.50');
  });

  test('formattedDate returns locale date string', () => {
    const order = new Order(rawOrder);
    expect(order.formattedDate).not.toBe('—');
  });

  test('formattedDate returns "—" when date is null', () => {
    const order = new Order({ ...rawOrder, date: null });
    expect(order.formattedDate).toBe('—');
  });

  test('itemSummary joins all items', () => {
    const order = new Order({
      ...rawOrder,
      items: [{ name: 'Pizza', quantity: 2 }, { name: 'Salad', quantity: 1 }],
    });
    expect(order.itemSummary).toBe('Pizza x 2, Salad x 1');
  });

  test('statusClass lowercases and hyphenates', () => {
    const order = new Order(rawOrder);
    expect(order.statusClass).toBe('food-processing');
  });

  test('isWithin("all") always returns true', () => {
    const order = new Order(rawOrder);
    expect(order.isWithin('all')).toBe(true);
  });

  test('isWithin("day") returns true for today', () => {
    const order = new Order({ ...rawOrder, date: new Date().toISOString() });
    expect(order.isWithin('day')).toBe(true);
  });

  test('isWithin("day") returns false for yesterday', () => {
    const yesterday = new Date(Date.now() - 2 * 86_400_000);
    const order = new Order({ ...rawOrder, date: yesterday.toISOString() });
    expect(order.isWithin('day')).toBe(false);
  });

  test('isWithin("year") returns true for current year', () => {
    const order = new Order({ ...rawOrder, date: new Date().toISOString() });
    expect(order.isWithin('year')).toBe(true);
  });

  test('defaults to Food Processing when status missing', () => {
    const order = new Order({ _id: 'x', amount: 0 });
    expect(order.status).toBe(ORDER_STATUSES.FOOD_PROCESSING);
  });
});

describe('FoodItem', () => {
  test('parses raw data', () => {
    const item = new FoodItem({ _id: 'f1', name: 'Salad', price: 8.5, category: 'Salad', image: 'salad.jpg' });
    expect(item.name).toBe('Salad');
    expect(item.price).toBe(8.5);
  });

  test('formattedPrice returns dollar format', () => {
    const item = new FoodItem({ _id: 'f1', name: 'Pizza', price: 12, category: 'Pizza' });
    expect(item.formattedPrice).toBe('$12.00');
  });

  test('defaults description to empty string', () => {
    const item = new FoodItem({ _id: 'f1', name: 'X', price: 5 });
    expect(item.description).toBe('');
  });
});

describe('DashboardStats', () => {
  const orders = [
    new Order({ _id: 'o1', amount: 20, status: 'Food Processing', items: [], address: {} }),
    new Order({ _id: 'o2', amount: 30, status: 'Delivered', items: [], address: {} }),
    new Order({ _id: 'o3', amount: 15, status: 'Out for Delivery', items: [], address: {} }),
  ];

  test('calculates totalOrders', () => {
    expect(new DashboardStats(orders).totalOrders).toBe(3);
  });

  test('calculates totalRevenue', () => {
    expect(new DashboardStats(orders).totalRevenue).toBe(65);
  });

  test('counts by status', () => {
    const stats = new DashboardStats(orders);
    expect(stats.foodProcessing).toBe(1);
    expect(stats.delivered).toBe(1);
    expect(stats.outForDelivery).toBe(1);
  });

  test('formattedRevenue returns dollar format', () => {
    expect(new DashboardStats(orders).formattedRevenue).toBe('$65.00');
  });

  test('handles empty orders', () => {
    const stats = new DashboardStats([]);
    expect(stats.totalOrders).toBe(0);
    expect(stats.totalRevenue).toBe(0);
  });
});

describe('Constants', () => {
  test('ORDER_STATUSES has 3 values', () => {
    expect(Object.keys(ORDER_STATUSES)).toHaveLength(3);
  });

  test('FOOD_CATEGORIES has 8 values', () => {
    expect(FOOD_CATEGORIES).toHaveLength(8);
  });
});
