import {Customer, DeliveryPartner} from '../../models/index.js';
import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
	const accessToken = jwt.sign(
		{userId : user_.id, role: user.role},
		process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'1d'}
	)
	const refreshToken = jwt.sign(
		{userId : user_.id, role: user.role},
		process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'7d'}
	)
	return {accessToken, refreshToken};
};


export const loginCustomer = async (req, res) => {
	try{
		const {phone} = req.body;
		let customer = await Customer.findOne({where: {phone}});


		if(!customer){
			customer = new Customer({
				phone,
				role: "Customer",
				isActivated:true
			})
			await customer.save();
		}
		const {refreshToken,accessToken} = generateTokens(customer);
		return res.send({
			message: customer? "Login Successful" : "User Registered Successfully",
			accessToken,
			refreshToken,
			customer
		});



	}catch(err){
		res.status(500).json({message: err.message});
	}
};


export const loginDeliveryPartner = async (req, res) => {
	try{
		const {email, password} = req.body;
		const deliveryPartner = await DeliveryPartner.findOne({email});
		if(!deliveryPartner){
			return res.status(404).json({message: "Delivery Partner not found"});
		}
		const isMatch = password === deliveryPartner.password;
		if(!isMatch){
			return res.status(401).json({message: "Invalid Credentials"});
		}
		const {refreshToken,accessToken} = generateTokens(deliveryPartner);
		return res.send({
			message: "Login Successful",
			accessToken,
			refreshToken,
			deliveryPartner
		});

	}
	catch(err){
		res.status(500).json({message: err.message});
	}
};

export const refreshToken = async (req, res) => {
	const {refreshToken} = req.body;
	if(!refreshToken){
		return res.status(401).json({message: "No token provided"});
	}
	try{
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const userId = decoded.userId;
		const role = decoded.role;
		let user;
		if(role === "Customer"){
			user = await Customer.findById(userId);
		}else if(role === "DeliveryPartner"){
			user = await DeliveryPartner.findById(userId);
		}else{
			return res.status(400).json({message: "Invalid role"});
		}


		if(!user){
			return res.status(404).json({message: "User not found"});
		}


		const {accessToken,refreshToken:newRefreshToken} = generateTokens(user);
		return res.json({
			message: "Token refreshed successfully",
			accessToken,
			refreshToken: newRefreshToken
		});


	}catch(err){
		res.status(500).json({message: err.message});
	}
};



export const fetchUser = async (req, res) => {
	try{
		const {userId, role} = req.user;
		let user;


		if(role === "Customer"){
			user = await Customer.findById(userId);
		}else if(role === "DeliveryPartner"){
			user = await DeliveryPartner.findById(userId);
		}else{
			return res.status(400).json({message: "Invalid role"});
		}

		if(!user){
			return res.status(404).json({message: "User not found"});
		}

		return res.send({
			message: "User fetched successfully",
			user
		});


	}catch(err){
		res.status(500).json({message: err.message});
	}
};

