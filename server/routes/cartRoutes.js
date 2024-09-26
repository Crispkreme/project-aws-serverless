const express = require("express");
const router = express.Router();

const cartControllers = require("../controllers/cartControllers");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log('Socket instance has been set');
}

// Router for Get cart
router.get('/showCart',cartControllers.getCartItems);

// Router for Add order
router.post('/addToCart',cartControllers.addToCart);

// Router for Edit quantity
router.put('/editCartItem',cartControllers.editCartItem);

// Router for Edit quantity
router.delete('/deleteCartItem',cartControllers.deleteCartItem);


// module.exports = router;
module.exports = function () {
    return router;
  };