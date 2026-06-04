const Product = require('../models/Product');
const Category = require('../models/Category');

function normalizarProducto(body, permitirParcial = false) {
  const data = {};

  if (!permitirParcial || Object.prototype.hasOwnProperty.call(body, 'nombre')) {
    data.nombre = typeof body.nombre === 'string' ? body.nombre.trim() : body.nombre;
  }

  if (!permitirParcial || Object.prototype.hasOwnProperty.call(body, 'descripcion')) {
    data.descripcion = typeof body.descripcion === 'string' && body.descripcion.trim()
      ? body.descripcion.trim()
      : null;
  }

  if (!permitirParcial || Object.prototype.hasOwnProperty.call(body, 'precio')) {
    data.precio = body.precio === '' || body.precio === undefined || body.precio === null
      ? null
      : Number(body.precio);
  }

  if (!permitirParcial || Object.prototype.hasOwnProperty.call(body, 'stock')) {
    data.stock = body.stock === '' || body.stock === undefined || body.stock === null
      ? 0
      : Number(body.stock);
  }

  if (!permitirParcial || Object.prototype.hasOwnProperty.call(body, 'imagen')) {
    data.imagen = typeof body.imagen === 'string' && body.imagen.trim()
      ? body.imagen.trim()
      : null;
  }

  const categoryId =
    body.categoryId ??
    body.CategoryId ??
    body.categoriaId ??
    body.categoria_id;

  if (!permitirParcial || categoryId !== undefined) {
    data.CategoryId = categoryId === '' || categoryId === null || categoryId === undefined
      ? null
      : Number(categoryId);
  }

  return data;
}

exports.getProducts = async (req, res) => {
  try {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;

    // Mantener compatibilidad: si no se pide paginación, devolvemos el arreglo como antes.
    const usarPaginacion = pageRaw !== undefined || limitRaw !== undefined;

    if (!usarPaginacion) {
      const products = await Product.findAll({
        include: {
          model: Category,
          attributes: ['id', 'nombre']
        },
        order: [['id', 'ASC']]
      });

      return res.json(products);
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

    const result = await Product.findAndCountAll({
      include: {
        model: Category,
        attributes: ['id', 'nombre']
      },
      order: [['id', 'ASC']],
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
      error: 'No se pudieron obtener los productos'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = normalizarProducto(req.body);

    if (!data.nombre) {
      return res.status(400).json({
        error: 'El nombre es obligatorio'
      });
    }

    if (data.precio === null || Number.isNaN(data.precio)) {
      return res.status(400).json({
        error: 'El precio es obligatorio y debe ser numérico'
      });
    }

    if (Number.isNaN(data.stock)) {
      return res.status(400).json({
        error: 'El stock debe ser numérico'
      });
    }

    if (data.CategoryId !== null && Number.isNaN(data.CategoryId)) {
      return res.status(400).json({
        error: 'La categoría debe ser numérica'
      });
    }

    if (data.CategoryId !== null) {
      const category = await Category.findByPk(data.CategoryId);

      if (!category) {
        return res.status(400).json({
          error: 'La categoría indicada no existe'
        });
      }
    }

    const product = await Product.create(data);

    const productWithCategory = await Product.findByPk(product.id, {
      include: {
        model: Category,
        attributes: ['id', 'nombre']
      }
    });

    res.status(201).json(productWithCategory);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo crear el producto'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    const data = normalizarProducto(req.body, true);

    if (Object.prototype.hasOwnProperty.call(data, 'nombre') && !data.nombre) {
      return res.status(400).json({
        error: 'El nombre no puede estar vacío'
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, 'precio') && (data.precio === null || Number.isNaN(data.precio))) {
      return res.status(400).json({
        error: 'El precio debe ser numérico'
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, 'stock') && Number.isNaN(data.stock)) {
      return res.status(400).json({
        error: 'El stock debe ser numérico'
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, 'CategoryId') && data.CategoryId !== null && Number.isNaN(data.CategoryId)) {
      return res.status(400).json({
        error: 'La categoría debe ser numérica'
      });
    }

    if (Object.prototype.hasOwnProperty.call(data, 'CategoryId') && data.CategoryId !== null) {
      const category = await Category.findByPk(data.CategoryId);

      if (!category) {
        return res.status(400).json({
          error: 'La categoría indicada no existe'
        });
      }
    }

    await product.update(data);

    const updatedProduct = await Product.findByPk(product.id, {
      include: {
        model: Category,
        attributes: ['id', 'nombre']
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo actualizar el producto'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    await product.destroy();

    res.json({
      message: 'Producto eliminado'
    });
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo eliminar el producto'
    });
  }
};
