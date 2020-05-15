const express 	= require("express");
const Joi    	= require("@hapi/joi");
const mongoose  = require("mongoose");
const bcrypt    = require("bcrypt");
const jwt		= require("jsonwebtoken");


const UserModel = require("../models/userModel");
const TokenModel= require("../models/tokenModel");
const tokenValidator = require("../middleware/tokenValidator");

const LoginFormValidator = require("../validation/userLoginForm");
const RegistrationFormValidator = require("../validation/userRegistrationForm");



const router 	= express.Router();



const UserRoutes = {

	registerAction:  (req, res) => {

		let userInfo = req.body;
		const {error, value} = RegistrationFormValidator.validate(userInfo);
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
	},

	loginAction: (req, res) => {
		const loginInfo = req.body;
		const {error, value} = LoginFormValidator.validate(loginInfo);

		if (error) return res.status(400).json({
			error: true,
			message: error.details[0].message
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
	},


	validateAction: (req, res) => {
		res.json({
			error: false,
			message: "Valid"
		});
	}

}

router.all("/validate", tokenValidator, UserRoutes.validateAction);
router.post("/register", UserRoutes.registerAction);
router.post('/login', UserRoutes.loginAction);

module.exports = router;


