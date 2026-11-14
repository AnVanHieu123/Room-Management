const CategoryService = require('../services/category.service');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

class CategoryController {
    async createCategory(req, res) {
        const { nameCategory } = req.body;
        if (!nameCategory) {
            throw new BadRequestError('Vui lòng nhập tên danh mục');
        }
        const category = await CategoryService.createCategory(nameCategory);
        new Created({ message: 'success', metadata: category }).send(res);
    }

    async getAllCategory(req, res) {
        const categories = await CategoryService.getAllCategory();
        new OK({ message: 'success', metadata: categories }).send(res);
    }

    async updateCategory(req, res) {
        const { id } = req.params;
        const { nameCategory } = req.body;
        const category = await CategoryService.updateCategory(id, nameCategory);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        const category = await CategoryService.deleteCategory(id);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async getHousesByCategory(req, res) {
        const houses = await CategoryService.getHousesByCategory();
        new OK({ message: 'success', metadata: houses }).send(res);
    }
}

module.exports = new CategoryController();
