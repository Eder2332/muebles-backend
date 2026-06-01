const express = require('express');

const router = express.Router();

const adminController =
    require('../controllers/adminController');

const adminAuth =
    require('../middlewares/adminAuth');

router.get(
    '/users',
    adminAuth,
    adminController.getUsers
);

router.delete(
    '/users/:id',
    adminAuth,
    adminController.deleteUser
);

router.put(
'/users/:id',
adminAuth,
adminController.updateUser
);

module.exports = router;