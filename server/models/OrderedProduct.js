const mongoose = require("mongoose");

const orderedProductSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: {
        type: String,
        required: [true, "Product name is required"],
      },
      description: {
        type: String,
        required: [true, "Description is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
      },
      price: {
        type: Number,
        required: [true, "Price is required"],
      },
      addedOn: {
        type: Date,
        default: new Date(),
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
  },
});

module.exports = mongoose.model("OrderedProduct", orderedProductSchema);
