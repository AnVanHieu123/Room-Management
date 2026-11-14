const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin } = require('../auth/checkAuth');

const categoryController = require('../controller/category.controller');

router.post('/create', authAdmin, asyncHandler(categoryController.createCategory));
router.get('/list', asyncHandler(categoryController.getAllCategory));
router.put('/update/:id', authAdmin, asyncHandler(categoryController.updateCategory));
router.delete('/delete/:id', authAdmin, asyncHandler(categoryController.deleteCategory));
router.get('/houses', asyncHandler(categoryController.getHousesByCategory));

module.exports = router;
