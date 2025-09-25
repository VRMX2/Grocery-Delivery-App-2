import "dotenv/config";
import {Category, Product} from "./src/models/index.js";
import {categories, products} from "./seedData.js";
import mongoose from "mongoose";

async function seedDataBase(){
	try{
        await mongoose.connect(process.env.MONGODB_URI);
		await Category.deleteMany();
		await Product.deleteMany();
		const categoryDocs = await Category.insertMany(categories);
		const categoryMap = categoryDocs.reduce((map, category) => {
			map[category.name] = category._id;
            return map;
		}, {});

        const productsWithCategoryIds = products.map(product => ({
            ...product,
            category: categoryMap[product.category]
        }));

        await Product.insertMany(productsWithCategoryIds);

        console.log("DATABASE SEEDED SUCCESSFULLY");
	}
	catch(err){
		console.log(err);
	}finally{
		mongoose.connection.close();
    }
}
seedDataBase();