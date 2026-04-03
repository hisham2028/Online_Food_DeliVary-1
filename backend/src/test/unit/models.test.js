/**
 * Model unit tests - UserModel, FoodModel, OrderModel
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Shared mock model ──────────────────────────────────────────────────────
const makeMockModel = () => ({
  findById: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
});

// Stored so individual tests can adjust it
let _mockUserMongoModel = makeMockModel();
let _mockFoodMongoModel = makeMockModel();
let _mockOrderMongoModel = makeMockModel();

vi.mock('mongoose', () => {
  const schemaMock = vi.fn().mockImplementation(function () {
    this.index = vi.fn();
  });

  return {
    default: {
      Schema: schemaMock,
      models: {},
      model: vi.fn((name) => {
        if (name === 'user') return _mockUserMongoModel;
        if (name === 'Food') return _mockFoodMongoModel;
        if (name === 'orders') return _mockOrderMongoModel;
        return makeMockModel();
      }),
    },
  };
});

// ─── Import models after mock ───────────────────────────────────────────────
const { default: UserModel } = await import('../../models/UserModel.js');
const { default: FoodModel } = await import('../../models/FoodModel.js');
const { default: OrderModel } = await import('../../models/OrderModel.js');

// ─── UserModel ──────────────────────────────────────────────────────────────
describe('UserModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create() saves a new user', async () => {
    const savedUser = { _id: 'u1', name: 'Alice', email: 'a@b.com' };
    const saveFn = vi.fn().mockResolvedValue(savedUser);

    // Replace the model constructor so `new this.model(data)` returns a saveable object
    const OrigConstructor = _mockUserMongoModel;
    UserModel.model = function (data) {
      return { ...data, save: saveFn };
    };
    UserModel.model.findById = OrigConstructor.findById;
    UserModel.model.findOne = OrigConstructor.findOne;
    UserModel.model.find = OrigConstructor.find;
    UserModel.model.findByIdAndUpdate = OrigConstructor.findByIdAndUpdate;
    UserModel.model.findByIdAndDelete = OrigConstructor.findByIdAndDelete;

    const result = await UserModel.create({ name: 'Alice', email: 'a@b.com', password: 'hash' });
    expect(saveFn).toHaveBeenCalled();
    expect(result).toEqual(savedUser);

    // restore
    UserModel.model = OrigConstructor;
  });

  it('findById() delegates to model.findById', async () => {
    const user = { _id: 'u1', name: 'Alice' };
    _mockUserMongoModel.findById.mockResolvedValue(user);
    UserModel.model = _mockUserMongoModel;

    const result = await UserModel.findById('u1');
    expect(_mockUserMongoModel.findById).toHaveBeenCalledWith('u1');
    expect(result).toEqual(user);
  });

  it('findByEmail() delegates to model.findOne', async () => {
    const user = { _id: 'u1', email: 'a@b.com' };
    _mockUserMongoModel.findOne.mockResolvedValue(user);
    UserModel.model = _mockUserMongoModel;

    const result = await UserModel.findByEmail('a@b.com');
    expect(_mockUserMongoModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(result).toEqual(user);
  });

  it('updateById() delegates to model.findByIdAndUpdate', async () => {
    const updated = { _id: 'u1', name: 'Bob' };
    _mockUserMongoModel.findByIdAndUpdate.mockResolvedValue(updated);
    UserModel.model = _mockUserMongoModel;

    const result = await UserModel.updateById('u1', { name: 'Bob' });
    expect(_mockUserMongoModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', { name: 'Bob' }, { new: true });
    expect(result).toEqual(updated);
  });

  it('deleteById() delegates to model.findByIdAndDelete', async () => {
    _mockUserMongoModel.findByIdAndDelete.mockResolvedValue({ _id: 'u1' });
    UserModel.model = _mockUserMongoModel;

    const result = await UserModel.deleteById('u1');
    expect(_mockUserMongoModel.findByIdAndDelete).toHaveBeenCalledWith('u1');
  });

  it('updateCart() calls findByIdAndUpdate with cartData', async () => {
    _mockUserMongoModel.findByIdAndUpdate.mockResolvedValue({});
    UserModel.model = _mockUserMongoModel;

    await UserModel.updateCart('u1', { item1: 2 });
    expect(_mockUserMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { cartData: { item1: 2 } },
      { new: true }
    );
  });

  it('clearCart() calls findByIdAndUpdate with empty cartData', async () => {
    _mockUserMongoModel.findByIdAndUpdate.mockResolvedValue({});
    UserModel.model = _mockUserMongoModel;

    await UserModel.clearCart('u1');
    expect(_mockUserMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { cartData: {} },
      { new: true }
    );
  });

  it('getModel() returns the underlying mongoose model', () => {
    UserModel.model = _mockUserMongoModel;
    expect(UserModel.getModel()).toBe(_mockUserMongoModel);
  });
});

// ─── FoodModel ──────────────────────────────────────────────────────────────
describe('FoodModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FoodModel.model = _mockFoodMongoModel;
  });

  it('create() saves a new food item', async () => {
    const savedFood = { _id: 'f1', name: 'Pizza' };
    const saveFn = vi.fn().mockResolvedValue(savedFood);

    const orig = FoodModel.model;
    FoodModel.model = function (data) {
      return { ...data, save: saveFn };
    };
    Object.assign(FoodModel.model, orig);

    const result = await FoodModel.create({ name: 'Pizza', price: 10 });
    expect(saveFn).toHaveBeenCalled();
    expect(result).toEqual(savedFood);

    FoodModel.model = _mockFoodMongoModel;
  });

  it('findById() delegates to model.findById', async () => {
    const food = { _id: 'f1', name: 'Pizza' };
    _mockFoodMongoModel.findById.mockResolvedValue(food);

    const result = await FoodModel.findById('f1');
    expect(_mockFoodMongoModel.findById).toHaveBeenCalledWith('f1');
    expect(result).toEqual(food);
  });

  it('findAll() delegates to model.find', async () => {
    const foods = [{ _id: 'f1' }, { _id: 'f2' }];
    _mockFoodMongoModel.find.mockResolvedValue(foods);

    const result = await FoodModel.findAll();
    expect(_mockFoodMongoModel.find).toHaveBeenCalledWith({});
    expect(result).toEqual(foods);
  });

  it('findAll() passes filter argument', async () => {
    _mockFoodMongoModel.find.mockResolvedValue([]);

    await FoodModel.findAll({ category: 'Italian' });
    expect(_mockFoodMongoModel.find).toHaveBeenCalledWith({ category: 'Italian' });
  });

  it('updateById() delegates to model.findByIdAndUpdate', async () => {
    const updated = { _id: 'f1', name: 'Updated Pizza' };
    _mockFoodMongoModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await FoodModel.updateById('f1', { name: 'Updated Pizza' });
    expect(_mockFoodMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'f1',
      { name: 'Updated Pizza' },
      { new: true, runValidators: true }
    );
    expect(result).toEqual(updated);
  });

  it('deleteById() delegates to model.findByIdAndDelete', async () => {
    _mockFoodMongoModel.findByIdAndDelete.mockResolvedValue({ _id: 'f1' });

    await FoodModel.deleteById('f1');
    expect(_mockFoodMongoModel.findByIdAndDelete).toHaveBeenCalledWith('f1');
  });

  it('search() calls model.find with $text search', async () => {
    const foods = [{ _id: 'f1', name: 'Pizza' }];
    _mockFoodMongoModel.find.mockResolvedValue(foods);

    const result = await FoodModel.search('pizza');
    expect(_mockFoodMongoModel.find).toHaveBeenCalledWith({ $text: { $search: 'pizza' } });
    expect(result).toEqual(foods);
  });

  it('getModel() returns the underlying mongoose model', () => {
    expect(FoodModel.getModel()).toBe(_mockFoodMongoModel);
  });
});

// ─── OrderModel ─────────────────────────────────────────────────────────────
describe('OrderModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    OrderModel.model = _mockOrderMongoModel;
  });

  it('create() saves a new order', async () => {
    const savedOrder = { _id: 'o1', userId: 'u1', amount: 100 };
    const saveFn = vi.fn().mockResolvedValue(savedOrder);

    const orig = OrderModel.model;
    OrderModel.model = function (data) {
      return { ...data, save: saveFn };
    };
    Object.assign(OrderModel.model, orig);

    const result = await OrderModel.create({ userId: 'u1', amount: 100 });
    expect(saveFn).toHaveBeenCalled();
    expect(result).toEqual(savedOrder);

    OrderModel.model = _mockOrderMongoModel;
  });

  it('findById() delegates to model.findById', async () => {
    const order = { _id: 'o1', status: 'Food Processing' };
    _mockOrderMongoModel.findById.mockResolvedValue(order);

    const result = await OrderModel.findById('o1');
    expect(_mockOrderMongoModel.findById).toHaveBeenCalledWith('o1');
    expect(result).toEqual(order);
  });

  it('findByUserId() delegates to model.find', async () => {
    const orders = [{ _id: 'o1' }];
    _mockOrderMongoModel.find.mockResolvedValue(orders);

    const result = await OrderModel.findByUserId('u1');
    expect(_mockOrderMongoModel.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(result).toEqual(orders);
  });

  it('findAll() delegates to model.find', async () => {
    const orders = [{ _id: 'o1' }, { _id: 'o2' }];
    _mockOrderMongoModel.find.mockResolvedValue(orders);

    const result = await OrderModel.findAll();
    expect(_mockOrderMongoModel.find).toHaveBeenCalledWith({});
    expect(result).toEqual(orders);
  });

  it('updateById() delegates to model.findByIdAndUpdate', async () => {
    const updated = { _id: 'o1', status: 'Delivered' };
    _mockOrderMongoModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await OrderModel.updateById('o1', { status: 'Delivered' });
    expect(_mockOrderMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'o1',
      { status: 'Delivered' },
      { new: true }
    );
    expect(result).toEqual(updated);
  });

  it('deleteById() delegates to model.findByIdAndDelete', async () => {
    _mockOrderMongoModel.findByIdAndDelete.mockResolvedValue({ _id: 'o1' });

    await OrderModel.deleteById('o1');
    expect(_mockOrderMongoModel.findByIdAndDelete).toHaveBeenCalledWith('o1');
  });

  it('updateStatus() calls updateById with status', async () => {
    _mockOrderMongoModel.findByIdAndUpdate.mockResolvedValue({ _id: 'o1', status: 'Delivered' });

    await OrderModel.updateStatus('o1', 'Delivered');
    expect(_mockOrderMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'o1',
      { status: 'Delivered' },
      { new: true }
    );
  });

  it('updatePaymentStatus() calls updateById with payment flag', async () => {
    _mockOrderMongoModel.findByIdAndUpdate.mockResolvedValue({ _id: 'o1', payment: true });

    await OrderModel.updatePaymentStatus('o1', true);
    expect(_mockOrderMongoModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'o1',
      { payment: true },
      { new: true }
    );
  });

  it('getModel() returns the underlying mongoose model', () => {
    expect(OrderModel.getModel()).toBe(_mockOrderMongoModel);
  });
});
