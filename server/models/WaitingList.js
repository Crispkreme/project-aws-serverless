const mongoose = require("mongoose");

const waitingListSchema = new mongoose.Schema({
	productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
    },
	name: {
		type: String,
		required: [true, "Product name is required"]
	},
	description: {
		type: String,
		required: [true, "Description name is required"]
	},
	price: {
		type: Number,
		required: [true, "Price is required"]
	},
    quantity: {
        type: Number,
    },
	createdOn :{
		type: Date,
		default: new Date()
	}
});

module.exports = mongoose.model("WaitingList", waitingListSchema);