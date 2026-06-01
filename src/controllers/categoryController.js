const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['nombre', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudieron obtener las categorías'
    });
  }
};

exports.getCategoryWithProducts = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: {
        model: Product
      },
      order: [[Product, 'id', 'ASC']]
    });

    if (!category) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo obtener la categoría'
    });
  }
};
