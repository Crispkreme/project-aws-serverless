const Product = require("../models/Product");
const Cart = require("../models/Cart");
const OrderedProduct = require("../models/OrderedProduct");
const WaitingList = require("../models/WaitingList");

const { publishMessage } = require("./awsController.js"); // <---

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

module.exports.getOrderedProducts = (req, res) => {
  OrderedProduct.find({})
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

// Function to calculate the total amount for the ordered products
const calculateTotalAmount = (orderedProducts) => {
  let totalAmount = 0;
  for (const product of orderedProducts) {
    totalAmount += product.price * product.quantity;
  }
  return totalAmount;
};

// Function to place an order
module.exports.placeOrder = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const orderedProducts = [];
    const waitingListProducts = [];

    // Check product quantities and split into orderedProducts and waitingListProducts
    for (const product of cart.products) {
      const { quantity, productId } = product;

      // Retrieve the product from the database
      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const availableStock = existingProduct.stock;

      if (quantity <= availableStock) {
        // Sufficient stock, add to orderedProducts
        orderedProducts.push({
          productId: existingProduct._id,
          name: existingProduct.name,
          description: existingProduct.description,
          quantity,
          price: existingProduct.price,
        });

        // Update the stock in the database
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -quantity },
        });
      } else {
        // Insufficient stock, split into ordered and waiting list quantities
        const orderedQuantity = availableStock;
        const waitingListQuantity = quantity - availableStock;

        if (orderedQuantity > 0) {
          // Add to orderedProducts
          orderedProducts.push({
            productId: existingProduct._id,
            name: existingProduct.name,
            description: existingProduct.description,
            quantity: orderedQuantity,
            price: existingProduct.price,
          });

          // Update the stock in the database
          await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -orderedQuantity },
          });
        }

        if (waitingListQuantity > 0) {
          // Add to waitingListProducts
          const waitingProduct = new WaitingList({
            productId: existingProduct._id,
            name: existingProduct.name,
            description: existingProduct.description,
            quantity: waitingListQuantity,
            price: existingProduct.price,
          });
          waitingListProducts.push(waitingProduct);
          await waitingProduct.save();
        }
      }
    }

    // Create the ordered product
    const orderedProduct = new OrderedProduct({
      products: orderedProducts,
      totalAmount: calculateTotalAmount(orderedProducts),
    });

    // Save the ordered product
    await orderedProduct.save();

    // Remove the cart
    await Cart.findByIdAndRemove(cartId);

    // const { publishMessage } = require("./awsController.js");
    publishMessage(orderedProduct._id); // <---

    res.status(200).json({
      message: "Order placed successfully",
      orderedProducts,
      waitingListProducts,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.setSocketIO = setSocketIO;
