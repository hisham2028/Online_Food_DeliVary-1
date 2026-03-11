class RepositoryFactory {
  static createRepository(type, modelOrConnection, tableName) {
    switch (type) {
      case 'mongoose':
        return new MongooseAdapter(modelOrConnection);
      case 'sql':
        return new SQLAdapter(modelOrConnection, tableName);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
}
// Target Interface
class IRepository {
  async create(data) {}
  async findById(id) {}
}

// Adapter: Adapts Mongoose to IRepository
class MongooseAdapter extends IRepository {
  constructor(mongooseModel) {
    super();
    this.model = mongooseModel;
  }
  
  async create(data) {
    const doc = new this.model(data);
    return await doc.save();  // Adapts Mongoose's interface
  }
}