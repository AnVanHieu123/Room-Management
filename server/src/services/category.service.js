const modelCategory = require('../models/category.model');
// const modelHouse = require('../models/house.model');

class CategoryService {
    async createCategory(nameCategory) {
        const category = await modelCategory.create({ nameCategory });
        return category;
    }

    async getAllCategory() {
        const categories = await modelCategory.find();
        return categories;
    }

    async updateCategory(id, nameCategory) {
        const category = await modelCategory.findOneAndUpdate({ _id: id }, { nameCategory }, { new: true });
        return category;
    }

    async deleteCategory(id) {
        const category = await modelCategory.findOneAndDelete({ _id: id });
        return category;
    }

    // async getHousesByCategory() {
    //     const categories = await modelCategory.find();
    //     const data = await Promise.all(
    //         categories.map(async (category) => {
    //             const houses = await modelHouse.find({ categoryId: category._id, status: 'active' });
    //             return {
    //                 ...category._doc,
    //                 houses: houses,
    //             };
    //         }),
    //     );
    //     return data;
    // }
}

module.exports = new CategoryService();
