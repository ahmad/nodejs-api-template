import mongoose from "mongoose";

export const PasswordResetSchema = new mongoose.Schema({

	user:  {
		_id: { type: mongoose.Schema.Types.ObjectId, required: true},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, index: true },
	},
	
	token: { type: String, unique: true, index: true },
	usedAt: { type: Date, default: null},

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});


export const PasswordReset =  mongoose.model("PasswordReset", PasswordResetSchema);