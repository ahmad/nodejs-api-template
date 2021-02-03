import { Token } from "../models/tokenModel";

const getToken = (headers: any) => {
	if (headers.authorization && headers.authorization.split(' ')[0] === 'Bearer'){
		return headers.authorization.split(' ')[1];
	} 
	
	return null;
}

export const ValidateToken = async (req: any, res: any, next: any) => {
	const token  = getToken(req.headers);
	if (!token) return res.status(401).json({
		error: true,
		message: "An auth token is required."
	});

	const tokenRecord = await Token.findOne({ token: token });
	if (!tokenRecord) return res.status(401).json({
		error: true,
		message: 'Invalid auth token provided.'
	});

	return next();
}