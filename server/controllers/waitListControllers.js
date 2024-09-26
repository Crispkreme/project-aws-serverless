const Product = require("../models/Product");
const Cart = require("../models/Cart");
const OrderedProduct = require("../models/OrderedProduct");
const WaitList = require("../models/WaitingList");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

module.exports.getWaitList = (req, res) => {
  WaitList.find({})
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

module.exports.addToCart = async (req, res) => {
  try {
    const { waitlistId, quantity } = req.body;

    // Check if the waitlist item exists
    const waitlistItem = await WaitList.findById(waitlistId);
    if (!waitlistItem) {
      return res.status(404).json({ error: "Waitlist item not found" });
    }

    const product = await Product.findById(waitlistItem.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const availableStock = product.stock;

    if (availableStock >= quantity) {
      const cartItem = {
        waitlistId: waitlistItem._id,
        productId: product._id,
        name: product.name,
        description: product.description,
        quantity: quantity,
        price: product.price,
        addedOn: new Date(),
      };

      // Get the cart or create a new one if it doesn't exist
      let cart = await Cart.findOne();
      if (!cart) {
        cart = new Cart();
      }

      // Add the item to the cart
      cart.products.push(cartItem);

      // Save the updated cart
      await cart.save();

      // Remove the item from the waitlist
      await WaitList.findByIdAndRemove(waitlistId);

      // Emit the waitlistUpdated event
      ioInstance.emit("waitlistUpdated", WaitList);

      res.status(200).json({ message: "Item added to cart successfully" });
    } else {
      res.status(400).json({ error: "Insufficient stock" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.setSocketIO = setSocketIO;
