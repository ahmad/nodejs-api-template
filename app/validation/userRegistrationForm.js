const Joi = require("@hapi/joi");


module.exports = Joi.object({
	firstName: Joi.string()
		.trim()
		.max(255)
		.min(1)
		.required(),
		
	lastName: Joi.string()
		.trim()
		.max(255)
		.min(1)
		.required(),

	title: Joi.string()
		.trim()
		.min(2)
		.max(255),

	company: Joi.string()
		.trim()
		.min(2)
		.max(255),

	phone: Joi.string()
		.trim(),

	email: Joi
		.string()
		.trim()
		.email()
		.required(),

	password: Joi.string()
		.trim()
		.min(6)
		.required()
})