import Customer from '../../models/Customer.js';
import DeliveryPartner from '../../models/DeliveryPartner.js';


export const updateUser = async(req, res) => {
	try{
		const { userId } = req.params;
		const updateData = req.body;

		let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);
		if(!user) return res.status(404).json({ error: "User not found" });


		let UserModel;
		if(user.role === 'customer'){
			UserModel = Customer;
		} else if(user.role === 'delivery_partner'){
			UserModel = DeliveryPartner;
		} else {
			return res.status(400).json({ error: "Invalid user role" });
		}

		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			{ $set: updateData },
			{ new: true, runValidators: true }  
		);

		if(!updatedUser) {
			return res.status(404).json({ error: "User not found after update" });
		}
		res.status(200).json(updatedUser);
        
	}
	catch(err){
        res.status(500).json({ error: err.message });
    }
}