const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const pm = new ProductManager();

router.get('/', async (req, res) => {
    const products = await pm.getProducts();
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const product = await pm.getProductById(parseInt(req.params.pid));
    product ? res.json(product) : res.status(404).json({ error: "Producto no encontrado" });
});

router.post('/', async (req, res) => {
    const newProduct = await pm.addProduct(req.body);
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    await pm.updateProduct(parseInt(req.params.pid), req.body);
    res.json({ message: "Producto actualizado" });
});

router.delete('/:pid', async (req, res) => {
    await pm.deleteProduct(parseInt(req.params.pid));
    res.json({ message: "Producto eliminado" });
});

module.exports = router;
