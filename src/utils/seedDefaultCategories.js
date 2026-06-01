const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  'sillas',
  'mesas',
  'escritorios',
  'estantes',
  'camas'
];

async function seedDefaultCategories() {
  for (const nombre of DEFAULT_CATEGORIES) {
    await Category.findOrCreate({
      where: { nombre }
    });
  }
}

module.exports = seedDefaultCategories;
