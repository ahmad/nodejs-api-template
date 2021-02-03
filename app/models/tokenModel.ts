const  mongoose = require("mongoose");

export const TokenSchema = new mongoose.Schema({

	user: { 
		_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true},
		firstName: { type: String },
		lastName: { type: String },
		email: { type: String }
	},
	disabled: { type: Boolean, required: true, default: false },
	token: { type: String, required: true, unique: true, index: true},
	createAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now }
	
});

export const Token =  mongoose.model("Token", TokenSchema);