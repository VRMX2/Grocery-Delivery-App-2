import Product from '../../models/product/product.js';

export const getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;
	try{
		const products = await Product.find({ category: categoryId })
			.select("-category")
			.exec();

         return res.send(products);   
	}catch(err){
		res.status(500).json({ message: err.message });
    }
}