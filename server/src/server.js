import fastify from 'fastify';
import 'dotenv/config';
import fastifySocketIO from 'fastify-socket.io';
import {registerRoutes} from './routes/index.js';
import { connectDB } from './config/connect.js';
import { PORT } from './config/config.js';
import { admin, buildAdminRouter } from './config/setup.js';


const start = async() => {
	await connectDB(process.env.MONGO_URI);
	const app = fastify();
	app.register(fastifySocketIO, {
		cors: {
			origin: '*',
		},
		pingInterval: 10000,
		pingTimeout: 5000,
		transports: ['websocket']
	});

	await registerRoutes(app);
	await buildAdminRouter(app);

	app.listen({port: PORT, host: '0.0.0.0'}, (err, addr) => {
		if(err){
			console.log(err);
		}else{
			console.log(`Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`);
		}
	});

	app.ready().then(() => {
		app.io.on('connection', (socket) => {
			console.log('New client connected');

			socket.on('joinRoom', (orderId) => {
				socket.join(orderId);
				console.log(`Client joined room: ${orderId}`);
			});


			socket.on('disconnect', () => {
				console.log('Client disconnected');
			});
		});
	});
}

start();