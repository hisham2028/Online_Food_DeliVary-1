/**
 * UNIT TEST — FoodFormFactory (Factory Pattern)
 * Tests: FoodFormData, FoodFormFactory.create, withField, toFormData
 */
import { describe, test, expect } from 'vitest';
import FoodFormFactory, { FoodFormData } from '../../factories/FoodFormFactory.js';

describe('FoodFormData', () => {
  test('defaults all fields', () => {
    const form = new FoodFormData();
    expect(form.name).toBe('');
    expect(form.description).toBe('');
    expect(form.price).toBe('');
    expect(form.category).toBe('Salad');
    expect(form.image).toBeNull();
  });

  test('accepts overrides', () => {
    const form = new FoodFormData({ name: 'Pizza', price: '12' });
    expect(form.name).toBe('Pizza');
    expect(form.price).toBe('12');
  });

  test('createEmpty() returns blank form', () => {
    const form = FoodFormData.createEmpty();
    expect(form.name).toBe('');
    expect(form.image).toBeNull();
  });

  test('toFormData() returns a FormData instance', () => {
    const form = new FoodFormData({ name: 'Burger', price: '10', category: 'Rolls' });
    const fd = form.toFormData();
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get('name')).toBe('Burger');
    expect(fd.get('price')).toBe('10');
    expect(fd.get('category')).toBe('Rolls');
  });

  test('toFormData() appends image when present', () => {
    const blob = new Blob(['fake'], { type: 'image/png' });
    const form = new FoodFormData({ name: 'X', price: '5', image: blob });
    const fd = form.toFormData();
    expect(fd.get('image')).toBeTruthy();
  });

  test('toFormData() omits image when null', () => {
    const form = new FoodFormData({ name: 'X', price: '5' });
    const fd = form.toFormData();
    expect(fd.get('image')).toBeNull();
  });
});

describe('FoodFormFactory', () => {
  test('create() returns FoodFormData with defaults', () => {
    const form = FoodFormFactory.create();
    expect(form).toBeInstanceOf(FoodFormData);
    expect(form.name).toBe('');
  });

  test('create() accepts overrides', () => {
    const form = FoodFormFactory.create({ name: 'Salad', price: '8' });
    expect(form.name).toBe('Salad');
    expect(form.price).toBe('8');
  });

  test('withField() returns a new instance with one field changed', () => {
    const original = FoodFormFactory.create({ name: 'Old' });
    const updated = FoodFormFactory.withField(original, 'name', 'New');

    expect(updated.name).toBe('New');
    expect(original.name).toBe('Old'); // immutable
    expect(updated).not.toBe(original);
  });

  test('withField() preserves other fields', () => {
    const original = FoodFormFactory.create({ name: 'Pizza', price: '12', category: 'Pizza' });
    const updated = FoodFormFactory.withField(original, 'price', '15');

    expect(updated.name).toBe('Pizza');
    expect(updated.category).toBe('Pizza');
    expect(updated.price).toBe('15');
  });
});
