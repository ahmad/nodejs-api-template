const  mongoose = require("mongoose");
const  Schema	 = mongoose.Schema;

const tokenSchema = new Schema({

	userId: { type: Schema.Types.ObjectId, required: true, index: true},
	token: { type: String, required: true, unique: true, index: true},
	createAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now }
	
});

module.exports = mongoose.model("Tokens", tokenSchema);