// const express = require("express");
// const router = express.Router();
// const productControllers = require("../controllers/productControllers");

// // Router for display product
// router.get("/",productControllers.getProduct);

// // Router for displaying single product
// router.get("/:productId",productControllers.getSingleProduct);

// // Router for Add product
// router.post('/addProduct', productControllers.addProduct);

// // Router for Update product
// router.put('/updateproduct/:productId',productControllers.updateProduct);

// // Router for Delete product
// router.delete('/deleteProduct/:productId',productControllers.deleteProduct);

// module.exports = function(io){
//     // productControllers.setSocketIO(io)
//     return router;
// };

// // module.exports = router;

const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

// Router for display product
router.get("/", productControllers.getProduct);

// Router for displaying single product
router.get("/:productId", productControllers.getSingleProduct);

// Router for Add product
router.post("/addProduct", productControllers.addProduct);

// Router for Update product
router.put("/updateproduct/:productId", productControllers.updateProduct);

// Router for Delete product
router.delete("/deleteProduct/:productId", productControllers.deleteProduct);

module.exports = function () {
  return router;
};
