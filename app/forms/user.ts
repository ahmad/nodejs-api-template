import Joi from "joi"

export const ForgotPassword = Joi.object({
	email: Joi.string().trim().email().required().lowercase()
});

export const ResetPassword = Joi.object({
	token: Joi.string().trim().required(),
	password: Joi.string().trim().required().min(6)
});


export const ChangeEmailForm = Joi.object({
	email: Joi.string().email().lowercase().required()
});

export const ChangePasswordForm = Joi.object({
	currentPassword: Joi.string().min(6).required(),
	newPassword: Joi.string().required().min(6).required()
});


export const LoginForm = Joi.object({
	email: Joi.string().trim().email().lowercase().required(),
	password: Joi.string().min(6).max(20).required()
});


export const UpdateProfileForm = Joi.object({
	firstName: Joi.string().trim().max(200).min(1),
	lastName: Joi.string().trim().max(200).min(1),
	title: Joi.string().trim().max(200),
	company: Joi.string().trim().max(200),
	phone: Joi.string().trim().min(6).max(15)
});

export const RegisterForm = Joi.object({
	firstName: Joi.string().trim().max(200).required(),
	lastName: Joi.string().trim().max(200).min(1).required(),
	title: Joi.string().trim().max(200),
	company: Joi.string().trim().max(200),
	phone: Joi.string().trim().min(6),
	email: Joi.string().trim().email().lowercase().required(),
	password: Joi.string().trim().min(6).required()
})