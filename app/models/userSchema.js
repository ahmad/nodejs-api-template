const  mongoose = require("mongoose");
const  Schema	 = mongoose.Schema;


const userSchema = new Schema({

	firstName: String,
	lastName: String,

	title: String,
	company: String,

	email: String,
	phone: String,

	password: String,

	createAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now }
	
});

