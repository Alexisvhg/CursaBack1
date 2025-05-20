const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/productManager');
const productManager = new ProductManager();

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, category, status } = req.query;
        const options = {
            limit: parseInt(limit) || 10,
            page: parseInt(page) || 1,
            sort,
            category,
            status: status === 'true' ? true : status === 'false' ? false : undefined
        };

        const result = await productManager.getProducts({}, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Get product by ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: 'error', error: 'Product not found' });
        }
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Add new product
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Update product
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', error: 'Product not found' });
        }
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Delete product
router.delete('/:pid', async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.pid);
        res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

module.exports = router;
