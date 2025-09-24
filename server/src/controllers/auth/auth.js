import {Customer, DeliveryPartner} from '../../models/index.js';
import jwt from 'jsonwebtoken';

const generateTokens = (user) => {
	const accessToken = jwt.sign(
		{userId : user_.id, role: user.role},
		process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'1d'}
	)
	const refreshToken = jwt.sign(
		{userId : user_.id, role: user.role},
		process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'7d'}
	)
	return {accessToken, refreshToken};
}