export class FoodFormData {
  constructor(overrides = {}) {
    this.name = overrides.name ?? '';
    this.description = overrides.description ?? '';
    this.price = overrides.price ?? '';
    this.category = overrides.category ?? 'Salad';
    this.image = overrides.image ?? null;
  }

  static createEmpty() {
    return new FoodFormData();
  }

  toFormData() {
    const fd = new FormData();
    fd.append('name', this.name);
    fd.append('description', this.description);
    fd.append('price', this.price);
    fd.append('category', this.category);
    if (this.image) {
      fd.append('image', this.image);
    }
    return fd;
  }
}

const FoodFormFactory = {
  create(overrides = {}) {
    return new FoodFormData(overrides);
  },

  withField(formData, field, value) {
    return new FoodFormData({ ...formData, [field]: value });
  },
};

export default FoodFormFactory;
