import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({

	firstName: { type: String, required: true },
	lastName: { type: String, required: true },

	title: { type: String },
	company: {type: String},

	email: { type: String, unique: true, index: true },
	phone: {type: String },

	password: { type: String},

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
	
});


export const User =  mongoose.model("User", UserSchema);