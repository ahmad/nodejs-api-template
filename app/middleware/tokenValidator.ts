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

	Token.findOne({ token: token }, (err: any, record: any) => {
		if (err) return res.status(500).json({
			message: "Unable to fetch token record."
		});

		if (!record) return res.status(401).json({
			"message": "Invalid auth token provided."
		});

		req.user 	= record.user;
		req.token 	= record.token;

		return next();
	});
}