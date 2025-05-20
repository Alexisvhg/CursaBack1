const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/productManager");
const productManager = new ProductManager("../data/products.json");

router.get("/home", async (req, res) => {
  const productos = await productManager.getProducts();
  res.render("home", { productos });
});

router.get("/realtimeproducts", async (req, res) => {
  const productos = await productManager.getProducts();
  res.render("realTimeProducts", { productos });
});

module.exports = router;