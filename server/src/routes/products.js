import {getAllCategories} from "../controllers/product/category.js";
import {getProductByCategoryId} from "../controllers/product/product.js";

export const categoryRoutes = (fastify, options) => {
	fastify.get('/categories', getAllCategories);
};

export const productRoutes = (fastify, options) => {
	fastify.get('/products/:categoryId', getProductByCategoryId);
};


