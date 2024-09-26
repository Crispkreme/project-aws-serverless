const Product = require("../models/Product");

// WebSocket instance
let ioInstance;

function setSocketIO(io) {
  ioInstance = io;
  console.log("Socket instance has been set");
}

// Get all products
module.exports.getProduct = (req, res) => {
  Product.find({})
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

// Get single product
module.exports.getSingleProduct = (req, res) => {
  Product.findById(req.params.productId)
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

// Add product
module.exports.addProduct = (req, res) => {
  let newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
  });

  newProduct
    .save()
    .then((prodAdded) => {
      console.log("Item saved to database:", prodAdded);

      ioInstance.emit("newProduct", prodAdded);

      res.json(prodAdded);
    })
    .catch((error) => res.send(error));
};

// Update product
module.exports.updateProduct = (req, res) => {
  let update = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
  };

  Product.findByIdAndUpdate(req.params.productId, update, { new: true })
    .then((updatedProduct) => {
      console.log("Product updated:", updatedProduct);

      ioInstance.emit("updatedProduct", updatedProduct);

      res.send(updatedProduct);
    })
    .catch((error) => res.send(error));
};

// Delete product
module.exports.deleteProduct = (req, res) => {
  Product.findByIdAndDelete(req.params.productId)
    .then((deletedProduct) => {
      console.log("Product deleted:", deletedProduct);

      ioInstance.emit("deleteProduct", deletedProduct);

      res.send(deletedProduct);
    })
    .catch((error) => res.send(error));
};

module.exports.setSocketIO = setSocketIO;
