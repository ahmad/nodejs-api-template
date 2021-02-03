import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/userModel";
import { Token } from "../models/tokenModel";
import { ValidateToken } from "../middleware/tokenValidator"
import { LoginForm, RegisterForm } from "../forms/user";

const router 		= express.Router();

const { APP_SECRET } = process.env;

if (!APP_SECRET){
	throw new Error("Please ensure that APP_SECRENT is defined in your .env file");
}


const UserRoutes 	= {
	registerAction:  (req: any, res: any) => {
		let {error, value: userInfo} = RegisterForm.validate(req.body);

		if (error) return res.status(400).json({
			error: true,
			message: error.details[0].message
		});
	
	
		// Hashing password
		bcrypt.hash(userInfo.password, 10, (err: any, hash: any) => {
			if (err) return res.status(400).json({
				error: true,
				message: err.string
			});
	
			userInfo.password = hash;
			const user = new User(userInfo);
			user.save((err: any, doc: any) => {
				if (err) return res.status(400).json({
					error: true,
					error_code: err.code,
					message: (err.code == 11000) ? "An account with that email address already exist." : "Unable to create account!" 
				});

				return res.json({
					error: false,
					account: {
						_id: doc._id,
						firstName: doc.firstName,
						lastName: doc.lastName,
						email: doc.email,
						title: doc.title,
						createdAt: doc.createdAt
					}
				});
			});
		});
	},

	loginAction: (req: any, res: any) => {
		const {error, value: loginInfo} = LoginForm.validate(req.body);

		if (error) return res.status(400).json({
			error: true,
			message: error.details[0].message
		});

		User.findOne({ email: loginInfo.email }, (err: any, user: any) => {
			if (err || !user) return res.status(400).json({
				error: true,
				message: 'Unable to authenticate user!'
			});

			bcrypt.compare(loginInfo.password, user.password, (err: any, matched: any) => {
				if (err) return res.status(400).json({
					error: true,
					message: 'Unable to authenticate user!'
				});

				jwt.sign({ id: user._id, r:  Math.floor(Math.random() * 10000000) }, APP_SECRET, (err: any, token: any) => {
					if (err) throw err;

					const t = new Token({
						token: token,
						user: {
							_id: user._id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email
						}
					});

					t.save((err: any, doc: any) => {
						if (err) throw err;

						res.setHeader('token', token);
						return res.json({
							error: false,
							token: token,
							account: {
								_id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email,
								createdAt: user.createdAt
							}
						});
					});
				});
			});
		});
	},


	validateAction: (req: any, res: any) => {
		res.json({
			error: false,
			message: "Valid"
		});
	}

}

router.all("/validate", ValidateToken, UserRoutes.validateAction);
router.post("/register", UserRoutes.registerAction);
router.post('/login', UserRoutes.loginAction);

module.exports = router;


