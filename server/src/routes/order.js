import {
	confirmOrder,
	createOrder,
	updateOrderStatus,
	getOrders,
	getOrderById
} from '../controllers/order/order.js';
import {verifyToken} from '../middleware/auth.js';

export const orderRoutes = (fastify, options) => {
	fastify.addHook('preHandler', async(request, reply) => {
		const isAuthenticated = await verifyToken(request, reply);
		if (!isAuthenticated) {
			return reply.status(401).send({message: 'Unauthorized'});
        }
    });

	fastify.post('/order', createOrder);
    fastify.get('/order', getOrders);
	fastify.put('/order/:orderId/confirm', confirmOrder);
	fastify.put('/order/:orderId/status', updateOrderStatus);
	fastify.get('/order/:orderId', getOrderById);
    
};