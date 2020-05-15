const TokenModel= require("../models/tokenModel");

module.exports = async (req, res, next) => {
	const { token } = req.headers;

	if (!token) return res.status(400).json({
		error: true,
		message: "Missing token"
	});

	const tokenRecord = await TokenModel.findOne({ token: token });
	if (!tokenRecord) return res.status(400).json({
		error: true,
		message: 'The token proivded is invalid'
	});

	return next();
}