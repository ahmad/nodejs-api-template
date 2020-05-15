const express 	= require("express");
const Joi    	= require("@hapi/joi");
const mongoose  = require("mongoose");
const bcrypt    = require("bcrypt");
const jwt		= require("jsonwebtoken");


const UserModel = require("../models/userModel");
const TokenModel= require("../models/tokenModel");
const tokenValidator = require("../middleware/tokenValidator");




const router 	= express.Router();


router.get("/", (req, res) => {
	res.json({
		user: false
	});
});


router.all('/validate', tokenValidator, (req, res) => {
	res.json({
		error: false,
		message: "Valid"
	});
});


router.post("/register", (req, res) => {

	const userRegisterScheme = Joi.object().keys({
		firstName: Joi.string().trim().max(255).min(1).required(),
		lastName: Joi.string().trim().max(255).min(1).required(),
	
		title: Joi.string().trim().min(2).max(255),
		company: Joi.string().trim().min(2).max(255),
	
		phone: Joi.string().trim(),
	
		email: Joi.string().trim().email().required(),
		password: Joi.string().trim().min(6).required()
	});

	let userInfo = req.body;
	const {error, value} = userRegisterScheme.validate(userInfo);
	if (error) return res.status(400).json({
		error: true,
		message: error.details[0].message
	});


	// Hashing password
	bcrypt.hash(userInfo.password, 10, (err, hash) => {
		if (err) return res.status(400).json({
			error: true,
			message: err.string
		});

		userInfo.password = hash;
		const user = new UserModel(userInfo);
		user.save(err => {
			if (err) return res.status(400).json({
				error: true,
				error_code: err.code,
				message: (err.code == 11000) ? "An account with that email address already exist." : "Unable to create account!" 
			});

			return res.json({
				error: false,
				info: user
			});
		});
	});
});

router.post('/login', (req, res) => {
	const userLoginSchema = Joi.object().keys({
		email: Joi.string().trim().email().required(),
		password: Joi.string().min(6).max(20).required()
	});

	const loginInfo = req.body;
	const {error, value} = userLoginSchema.validate(loginInfo);
	if (error) return res.status(400).json({
		error: true,
		message: "Invalid login credentials!"
	});

	UserModel.findOne({ email: loginInfo.email }, (err, user) => {
		if (err) return res.status(400).json({
			error: true,
			message: 'Unable to authenticate user!'
		});

		bcrypt.compare(loginInfo.password, user.password, (err, matched) => {
			if (err) return res.status(400).json({
				error: true,
				message: 'Unable to authenticate user!'
			});

			jwt.sign({ id: user._id, r:  Math.floor(Math.random() * 10000000) }, process.env.APP_SECRET, (err, token) => {
				if (err) throw err;


				const t = new TokenModel({
					token: token,
					userId: user._id
				});

				t.save((err, doc) => {
					if (err) throw err;

					res.setHeader('token', token);
					return res.json({
						error: false,
						token: token
					});
				});
			});
		});
	});
});

module.exports = router;