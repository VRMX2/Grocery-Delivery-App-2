import Category from '../../models/product/category.js';

export const getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find();
		res.status(200).json(categories);
	}
	catch (error) {
		res.status(500).json({ message: error.message });
	}

}