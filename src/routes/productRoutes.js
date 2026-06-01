const express = require('express');

const router = express.Router();

const productController =
require('../controllers/productController');

const adminAuth =
require('../middlewares/adminAuth');

router.get('/',
productController.getProducts);

router.post('/',
adminAuth,
productController.createProduct);

router.put('/:id',
adminAuth,
productController.updateProduct);

router.delete('/:id',
adminAuth,
productController.deleteProduct);

module.exports = router;