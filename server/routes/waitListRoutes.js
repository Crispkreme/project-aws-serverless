const express = require("express");
const router = express.Router();

const waitListControllers = require("../controllers/waitListControllers");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log('Socket instance has been set');
}

// Router for display product
router.get("/",waitListControllers.getWaitList);

// Router for place order 
router.post("/addToCart", waitListControllers.addToCart);


// module.exports = router;

module.exports = function () {
    return router;
};