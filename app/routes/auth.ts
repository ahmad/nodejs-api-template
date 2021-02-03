import express from "express";
import bcrypt from "bcrypt";

import { User } from "../models/userModel";
import { Token } from "../models/tokenModel";
import { ValidateToken } from "../middleware/tokenValidator"
import { PasswordReset } from "../models/passwordResetModel";
import { ChangeEmailForm, ChangePasswordForm, ForgotPassword, LoginForm, RegisterForm, ResetPassword, UpdateProfileForm } from "../forms/user";
import { generateRandomToken } from "../utils/helpers";


const router 			= express.Router();
const { APP_SECRET } 	= process.env;

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
					message: (err.code == 11000) ? "An account with that email address already exist." : "Unable to create account!" 
				});

				return res.json({
					_id: doc._id,
					firstName: doc.firstName,
					lastName: doc.lastName,
					email: doc.email,
					title: doc.title,
					company: doc.company,
					createdAt: doc.createdAt,
					updatedAt: doc.updatedAt
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
			if (err) return res.status(500).json({
				message: 'Unable to communicated with database.'
			});

			if (!user) return res.status(404).json({
				message: "No account was found matching the provided information."
			});

			bcrypt.compare(loginInfo.password, user.password, async (err: any, matched: any) => {
				if (err) return res.status(500).json({
					message: 'Unable to verify password.'
				});

				try {
					const token = await generateRandomToken(25);
					new Token({
						token: token,
						user: {
							_id: user._id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email
						}
					}).save((err: any, doc: any) => {
						if (err) return res.status(500).json({
							message: "Unable to save token."
						})
						
						return res.json({
							token: token,
							account: {
								_id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email,
								createdAt: user.createdAt
							}
						})
					})
				} catch (e) {
					return res.status(500).json({
						message: "Unable to generate auth token."
					})
				}
			})
		})
	},

	forgotPassword: (req: any, res:any) => {
		const { error, value } = ForgotPassword.validate(req.body);
		if (error) return res.status(400).json({
			message: error.details[0].message
		})

		const { email } = value;
		User.findOne({ "email": email }, async (err: any, user: any) => {
			if (err) return res.status(500).json({
				message: "Unable to fetch user record."
			})

			if (!user) return res.status(404).json({
				message: "There are no record in our system matching that email address."
			})

			try {
				const token = await generateRandomToken(16);
				new PasswordReset({
					user: user,
					token: token
				}).save((err: any, record: any) => {
					if (err) return res.status(500).json({
						message: "Unable to create token record."
					})

					return res.json({
						_id: record._id,
						token: record.token,
						user: user,
						createdAt: record.createdAt
					})
				})
			} catch (e) {
				return res.status(500).json({
					message: "Unable to generate password reset token."
				})
			}
		}).select("_id firstName lastName email");
	},

	resetPassword: (req: any, res: any) => {
		const { error, value } = ResetPassword.validate(req.body);
		if (error) return res.status(400).json({
			message: error.details[0].message
		})

		PasswordReset.findOneAndUpdate({
			token: value.token,
			usedAt: null
		}, {
			usedAt: Date.now()
		}, { useFindAndModify: false, new: false }, (err: any, record: any) => {
			if (err) return res.status(500).json({
				message: "Unable to fetch token record."
			})

			if (!record) return res.status(404).json({
				message: "Invalid token provided."
			})

			bcrypt.hash(value.password, 10, (err: Error, newPassword: string) => {
				if (err) return res.status(500).json({
					message: "Unable to hash password."
				})

				User.findByIdAndUpdate(record.user._id, {
					password: newPassword,
					passwordChangedAt: Date.now(),
					updatedAt: Date.now()
				}, { useFindAndModify: false, new: true }, (err: any, user: any) => {
					if (err) return res.status(500).json({
						message: "Unable to update password."
					})

					if (!user) return res.status(404).json({
						message: "User not found."
					})
					
					return res.json({
						message : "Password successfully updated."
					})
				}).select("_id firstName lastName email createdAt updatedAt")
			});
		})
	},

	getAccount: (req: any, res: any) => {
		const { _id: userId } = req.user;
		User.findById(userId, (err: any, user: any) => {
			if (err) return res.status(500).json({
				message: "Unable to fetch user account."
			});

			if (!user) return res.status(404).json({
				message: "User not found."
			})

			return res.json(user)
		}).select("_id firstName lastName email phone title company createdAt updatedAt")
	},

	updateAccount: (req: any, res: any) => {
		const { error, value: userInfo } = UpdateProfileForm.validate(req.body);
		if (error) return res.status(400).json({
			message: error.details[0].message
		});

		if (!userInfo || Object.keys(userInfo).length === 0) return res.status(400).json({
			message: "No data provided."
		});

		User.findByIdAndUpdate(req.user._id, {
			updatedAt: Date.now(),
			... userInfo 
		}, { useFindAndModify: false, new: true}, (err: any, user: any) => {
			if (err) return res.status(500).json({
				messgage: "Unable to fetch user record."
			});

			if (!user) return res.status(404).json({
				message: "User profile not found."
			});

			return res.json(user);
		}).select("_id firstName lastName title company email phone createdAt updatedAt")
	},

	changeEmail: (req: any, res: any) => {
		const { error, value } = ChangeEmailForm.validate(req.body);
		if (error) return res.status(400).json({
			message: error.details[0].message
		});

		User.findOne({
			email: value.email
		}, (err: any, account: any) => {
			if (err) return res.status(500).json({
				message: "Unable to communicate with database."
			})

			if (!account){
				// Update user profile with this new email.
				User.findByIdAndUpdate(req.user._id, {
					email: value.email,
					updatedAt: Date.now()
				}, { useFindAndModify: false, new: true }, (err: any, updatedAccount: any) => {
					if (err) return res.status(500).json({
						message: "Unable to find and update user email."
					})

					if (!updatedAccount) return res.status(410).json({
						message: "Unable to find user account."
					})

					return res.json(updatedAccount);
				}).select("_id firstName lastName email phone title company createdAt updatedAt")


			} else {
				if (account._id.equals(req.user._id) === true){
					return res.status(400).json({
						message: `Your account email address is already set to '${value.email}'`
					})

				} else {
					return res.status(409).json({
						message: "The provided email address is already being used by another account."
					})
				}
			}
		})
	},

	changePassword: (req: any, res: any) => {
		const { error, value } = ChangePasswordForm.validate(req.body);
		if (error) return res.status(400).json({
			message: error.details[0].message
		})

		if (value.currentPassword === value.newPassword) return res.status(400).json({
			message: "Current password and new password cannot be the same."
		})

		User.findById(req.user._id, (err: any, account: any) => {
			if (err) return res.status(500).json({
				message: "Unable to get user account."
			})

			if (!account) return res.status(404).json({
				message: "User account not found."
			})

			bcrypt.compare(value.currentPassword, account.password, (err: any, same: boolean) => {
				if (err) return res.status(500).json({
					message: "Unable to verify password."
				})

				if (same === false) return res.status(400).json({
					message: "Your current password does not match the one we have on record."
				})
	
				bcrypt.hash(value.newPassword, 10, (err: Error, hashed: string) => {
					if (err) return res.status(500).json({
						message: "Unable to hash password."
					})

					User.findByIdAndUpdate(req.user._id, {
						password: hashed,
						passwordChangedAt: Date.now(),
						updatedAt: Date.now()
					}, { useFindAndModify: false, new: true }, (err: any, updatedUser: any) => {
						if (err) return res.status(500).json({
							message: "Unable to update user password."
						})

						if (!updatedUser) return res.status(404).json({
							message: "User account not found."
						})

						return res.json({
							message: "Password successfully updated."
						})
					})
				})
			})
		})
	}
}


router.post("/register", UserRoutes.registerAction);
router.post('/login', UserRoutes.loginAction);
router.post('/forgot-password', UserRoutes.forgotPassword);
router.post('/reset-password', UserRoutes.resetPassword);

router.get("/account", ValidateToken, UserRoutes.getAccount);
router.patch("/account", ValidateToken, UserRoutes.updateAccount);
router.put("/account/email", ValidateToken, UserRoutes.changeEmail);
router.put("/account/password", ValidateToken, UserRoutes.changePassword);

module.exports = router;