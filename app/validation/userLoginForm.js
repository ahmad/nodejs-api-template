const Joi = require("@hapi/joi");

module.exports = Joi.object({
	email: Joi.string()
		.trim()
		.email()
		.required(),

	password: Joi.string()
		.min(6)
		.max(20)
		.required()
});