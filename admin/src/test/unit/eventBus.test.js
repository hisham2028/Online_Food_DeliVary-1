/**
 * UNIT TEST — EventBus (Observer Pattern)
 * Tests: on, emit, unsubscribe, EVENTS constants
 */
import { describe, test, expect, vi } from 'vitest';
import EventBus, { EVENTS } from '../../events/EventBus.js';

describe('EventBus', () => {
  test('is a singleton — same instance every time', () => {
    const a = EventBus;
    const b = EventBus;
    expect(a).toBe(b);
  });

  test('on() subscribes and emit() delivers payload', () => {
    const handler = vi.fn();
    EventBus.on('test:event', handler);

    EventBus.emit('test:event', { data: 42 });

    expect(handler).toHaveBeenCalledWith({ data: 42 });
  });

  test('on() returns an unsubscribe function', () => {
    const handler = vi.fn();
    const unsub = EventBus.on('test:unsub', handler);

    unsub();
    EventBus.emit('test:unsub', {});

    expect(handler).not.toHaveBeenCalled();
  });

  test('multiple subscribers all receive the event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    EventBus.on('test:multi', h1);
    EventBus.on('test:multi', h2);

    EventBus.emit('test:multi', 'hello');

    expect(h1).toHaveBeenCalledWith('hello');
    expect(h2).toHaveBeenCalledWith('hello');
  });

  test('emit on non-existent event does not throw', () => {
    expect(() => EventBus.emit('nonexistent', {})).not.toThrow();
  });
});

describe('EVENTS constants', () => {
  test('has FOOD_ADDED', () => {
    expect(EVENTS.FOOD_ADDED).toBe('food:added');
  });

  test('has FOOD_REMOVED', () => {
    expect(EVENTS.FOOD_REMOVED).toBe('food:removed');
  });

  test('has ORDER_STATUS_CHANGED', () => {
    expect(EVENTS.ORDER_STATUS_CHANGED).toBe('order:statusChanged');
  });

  test('has SIDEBAR_TOGGLE', () => {
    expect(EVENTS.SIDEBAR_TOGGLE).toBe('sidebar:toggle');
  });
});
