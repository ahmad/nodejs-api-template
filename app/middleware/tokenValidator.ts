import { Token } from "../models/tokenModel";

const { APP_SECRET } 	= process.env;

if (!APP_SECRET){
	throw new Error("Please ensure that APP_SECRENT is defined in your .env file");
}

const getToken = (headers: any) => {
	if (headers.authorization && headers.authorization.split(' ')[0] === 'Bearer'){
		return headers.authorization.split(' ')[1];
	} 
	
	return null;
}

export const ValidateToken = async (req: any, res: any, next: any) => {
	const token  = getToken(req.headers);
	if (!token) return res.status(401).json({
		message: "An auth token is required."
	});

	// Look for a record in the database matching the token and that has not been disabled.
	Token.findOne({ token: token, disabled: false}, (err: any, record: any) => {
		if (err) return res.status(500).json({
			message: "Unable to fetch token record."
		});

		if (!record) return res.status(401).json({
			"message": "The auth token provided is invalid"
		});

		req.user 	= record.user;
		req.token 	= record.token;

		return next();
	});

}