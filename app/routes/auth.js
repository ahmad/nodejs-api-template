const express 	= require("express");
const Joi    	= require("@hapi/joi");

const router 	= express.Router();


router.get("/", (req, res) => {
	res.json({
		user: false
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

	const {error, value} = userRegisterScheme.validate(req.body);
	if (error) return res.status(400).json({
		error: true,
		message: error.details[0].message
	});
});

router.get('/login', (req, res) => {
	res.json({
		login: true
	});
});

module.exports = router;