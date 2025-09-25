import Branch from "../../models/branch.js";
import Order from "../../models/order.js";
import {Customer,DeliveryPartner} from "../../models/user.js";


export const createOrder = async(req, res) => {
	try{
		const {userId} = req.user;
		const {items, branch, totalPrice} = req.body;
		const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);
        if(!customerData) return res.status(404).json({message: "Customer not found"});
		if(!branchData) return res.status(404).json({message: "Branch not found"});
		const newOrder = new Order({
            customer: userId,
			items: items.map((item) => ({
				id: item.id,
				item: item.item,
				count: item.count
            })),
			branch,
			totalPrice,
			deliveryLocation: {
				latitude: customerData.location.latitude,
				longitude: customerData.location.longitude,
                address: customerData.location.address || "No address provided",
			},
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.location.address || "No address provided",
			}
		});
		const savedOrder = await newOrder.save();
        return res.status(201).json(savedOrder);

        
	}
	catch(error){
		return res.status(500).json({message: error.message});
    }
};



export const confirmOrder = async(req, res) => {
	try{
		const {orderId} = req.params;
		const {userId} = req.user;
		const {deliveryPersonLocation} = req.body;

		const deliveryPerson = await DeliveryPartner.findById(userId);
		if(!deliveryPerson) return res.status(404).json({message: "Delivery partner not found"});
		const order = await Order.findById(orderId);
		if(!order) return res.status(404).json({message: "Order not found"});


		if(order.status !== "available") return res.status(400).json({message: "Order is not available for confirmation"});

		order.status = "confirmed";
        order.deliveryPerson = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation.latitude,
			longitude: deliveryPersonLocation.longitude,
            address: deliveryPersonLocation.address || "No address provided",
        };

		req.server.io.to(orderId).emit("orderConfirmer");
		await order.save();
		return res.status(200).json(order);
        
	}catch(error){
		return res.status(500).json({message: error.message});
    }
}


export const updateOrderStatus = async(req, res) => {
	try{
		const {orderId} = req.params;
		const {status, deliveryPersonLocation} = req.body;
        const {userId} = req.user;
		const deliveryPerson = await DeliveryPartner.findById(userId);

		if(!deliveryPerson) return res.status(404).json({message: "Delivery partner not found"});
        
		const order = await Order.findById(orderId);
        
		if(!order) return res.status(404).json({message: "Order not found"});
        
        if(order.deliveryPerson.toString() !== userId) return res.status(403).json({message: "You are not assigned to this order"});
		order.status = status;
		order.deliveryPersonLocation = deliveryPersonLocation;
		await order.save();
		req.server.io.to(orderId).emit("LiveTrackingUpdates", order);
        return res.status(200).json(order);
        
	}catch(error){
		return res.status(500).json({message: error.message});
    }
}


export const getOrders = async(req, res) => {
	try{
		const {status, customerId, deliveryPartnerId, branchId} = req.query;
		let query = {};
		if(status) query.status = status;
		if(customerId) query.customer = customerId;
		if(deliveryPartnerId){
			query.deliveryPerson = deliveryPartnerId;
			query.branch = branchId
		};
        const orders = await Order.find(query)
			.populate("customer branch items.item deliveryPartner"
		);
            
		return res.status(200).json(orders);
	}
	catch(error){
		return res.status(500).json({message: error.message});
    }
}

export const getOrderById = async(req, res) => {
	try{
		const {orderId} = req.params;
        const order = await Order.findById(orderId)
            .populate("customer branch items.item deliveryPerson"
        );
        if(!order) return res.status(404).json({message: "Order not found"});
        return res.status(200).json(order);
	}
	catch(error){
		return res.status(500).json({message: error.message});
    }
}