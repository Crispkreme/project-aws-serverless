const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product name is required"],
	},
	description: {
		type: String,
		required: [true, "Description name is required"],
	},
	price: {
		type: Number,
		required: [true, "Price is required"],
	},
	stock: {
		type: Number,
		required: [true, "stock is required"],
	},
	createdOn: {
		type: Date,
		default: new Date(),
	},
});

module.exports = mongoose.model("Product", productSchema);
