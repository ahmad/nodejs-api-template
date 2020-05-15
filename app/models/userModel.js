const  mongoose = require("mongoose");
const  Schema	 = mongoose.Schema;

const userModel = mongoose.model("User", new Schema({

	firstName: { type: String, required: true },
	lastName: { type: String, required: true },

	title: { type: String },
	company: {type: String},

	email: { type: String, unique: true, index: true },
	phone: {type: String },

	password: { type: String},

	createAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now }
	
}));

module.exports = userModel;