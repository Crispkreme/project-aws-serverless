const Cart = require("../models/Cart");
const Product = require("../models/Product");

let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

// Get Cart
module.exports.getCartItems = (req, res) => {
  Cart.find({})
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

// Add to Cart
module.exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cartItem = {
      productId: productId,
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

    // Add the product to the cart
    cart.products.push(cartItem);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// edit quantity
module.exports.editCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Get the cart
    let cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the product in the cart
    const product = cart.products.find(
      (product) => product._id.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    // Update the quantity of the product
    product.quantity = quantity;

    // If the quantity is zero, remove the product from the cart
    if (quantity === 0) {
      cart.products = cart.products.filter(
        (product) => product._id.toString() !== productId
      );
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//delete
module.exports.deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.body;

    // Get the cart
    let cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (product) => product._id.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    // Delete the cart ID if there are no products left
    if (cart.products.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res
        .status(200)
        .json({ message: "Cart and item deleted successfully" });
    }

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.setSocketIO = setSocketIO;
