const express = require("express");
const router = express.Router();

const orderedProductControllers = require("../controllers/orderedProductControllers");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

// Router for display product
router.get("/", orderedProductControllers.getOrderedProducts);

// Router for Add product
router.post("/placeOrder/:cartId", orderedProductControllers.placeOrder);

// module.exports = router;
module.exports = function () {
  return router;
};
