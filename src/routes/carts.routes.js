const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');

const cm = new CartManager();

router.post('/', async (req, res) => {
    const newCart = await cm.createCart();
    res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
    const cart = await cm.getCartById(parseInt(req.params.cid));
    cart ? res.json(cart) : res.status(404).json({ error: "Carrito no encontrado" });
});

router.post('/:cid/product/:pid', async (req, res) => {
    const updatedCart = await cm.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
    updatedCart ? res.json(updatedCart) : res.status(404).json({ error: "Carrito no encontrado" });
});

module.exports = router;
