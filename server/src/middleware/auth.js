import jwt from 'jsonwebtoken';


export const verifyToken = (req, res) => {
	try{
		const authHeader = req.headers['authorization'];
		if(!authHeader || !authHeader.startWith("Bearer")){
			return res.status(401).json({ message: 'Unauthorized' });
            
		}
		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		req.user = decoded;
        return true;
	}
	catch(err){
		res.status(401).json({ message: 'Unauthorized' });
    }
}