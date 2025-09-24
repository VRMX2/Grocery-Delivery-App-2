import mongoose from 'mongoose';

const categoryScema = new mongoose.Schema({
	name:  {type:String,required:true},
	image: {type:String,required:true}
})

export const Category = mongoose.model("Category",categoryScema);