const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
  try {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;

    // Mantener compatibilidad: si no se pide paginación, devolvemos el arreglo como antes.
    const usarPaginacion = pageRaw !== undefined || limitRaw !== undefined;

    if (!usarPaginacion) {
      const categories = await Category.findAll({
        order: [['nombre', 'ASC']]
      });

      return res.json(categories);
    }

    const page = Number(pageRaw || 1);
    const limit = Number(limitRaw || 10);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({
        error: 'Paginación inválida. Usa ?page=1&limit=10'
      });
    }

    const safeLimit = Math.min(limit, 100);
    const offset = (page - 1) * safeLimit;

    const result = await Category.findAndCountAll({
      order: [['nombre', 'ASC']],
      limit: safeLimit,
      offset
    });

    const total = result.count;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return res.json({
      data: result.rows,
      page,
      limit: safeLimit,
      total,
      totalPages
    });
  } catch (error) {
    return res.status(500).json({
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
