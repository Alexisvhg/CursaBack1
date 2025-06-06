const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Middleware para obtener el carrito activo
async function getActiveCart(req, res, next) {
    try {
        // Obtener el cartId más alto
        const lastCart = await Cart.findOne().sort({ cartId: -1 });
        
        let cart;
        if (!lastCart || lastCart.completed) {
            // Si no hay carritos o el último está completado, crear uno nuevo
            console.log('Creando nuevo carrito activo...');
            cart = new Cart({ completed: false });
            await cart.save();
            console.log('Nuevo carrito activo creado:', { cartId: cart.cartId, _id: cart._id });
        } else {
            // Usar el último carrito si no está completado
            cart = lastCart;
            console.log('Usando carrito activo existente:', { cartId: cart.cartId, _id: cart._id });
        }
        
        req.activeCart = cart;
        next();
    } catch (error) {
        console.error('Error al obtener carrito activo:', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
}

// Get first cart or create new one
router.get('/', async (req, res) => {
    try {
        // Buscar el primer carrito disponible
        let cart = await Cart.findOne().sort({ cartId: -1 });
        
        // Si no existe, crear uno nuevo
        if (!cart) {
            cart = new Cart();
            await cart.save();
        }

        res.json({ 
            status: 'success', 
            payload: {
                cartId: cart.cartId,
                products: cart.products
            }
        });
    } catch (error) {
        console.error('Error al obtener/crear carrito:', error);
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

// Get cart by ID with populated products
router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await Cart.findOne({ cartId }).populate('products.product');
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Cart not found' });
        }
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Create new cart
router.post('/', async (req, res) => {
    try {
        const cart = new Cart();
        await cart.save();
        
        // Asegurarnos de que el carrito tenga un cartId válido
        if (!cart.cartId) {
            throw new Error('Error al generar el ID del carrito');
        }

        console.log('Nuevo carrito creado:', { cartId: cart.cartId, _id: cart._id });

        res.json({ 
            status: 'success', 
            payload: {
                cartId: cart.cartId,
                products: cart.products
            }
        });
    } catch (error) {
        console.error('Error al crear carrito:', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Get active cart
router.get('/active', async (req, res) => {
    try {
        // Obtener el carrito activo más reciente
        const lastCart = await Cart.findOne().sort({ cartId: -1 });
        let cart;
        
        if (!lastCart || lastCart.completed) {
            // Si no hay carritos o el último está completado, crear uno nuevo
            console.log('Creando nuevo carrito activo...');
            cart = new Cart({ completed: false });
            await cart.save();
            console.log('Nuevo carrito activo creado:', { cartId: cart.cartId, _id: cart._id });
        } else {
            // Usar el último carrito si no está completado
            cart = lastCart;
            console.log('Usando carrito activo existente:', { cartId: cart.cartId, _id: cart._id });
        }
            
        res.json({ 
            status: 'success', 
            payload: {
                cartId: cart.cartId,
                products: cart.products
            }
        });
    } catch (error) {
        console.error('Error al obtener carrito activo:', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Add product to cart
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const { quantity = 1 } = req.body;

        console.log('Intentando agregar producto:', { pid, quantity });

        // Verificar si el producto existe
        const product = await Product.findById(pid);
        if (!product) {
            console.log('Producto no encontrado:', pid);
            return res.status(404).json({ 
                status: 'error', 
                error: 'Producto no encontrado' 
            });
        }

        // Obtener el carrito activo más reciente
        const lastCart = await Cart.findOne().sort({ cartId: -1 });
        let cart;
        
        if (!lastCart || lastCart.completed) {
            // Si no hay carritos o el último está completado, crear uno nuevo
            console.log('Creando nuevo carrito activo...');
            cart = new Cart({ completed: false });
            await cart.save();
            console.log('Nuevo carrito activo creado:', { cartId: cart.cartId, _id: cart._id });
        } else {
            // Usar el último carrito si no está completado
            cart = lastCart;
            console.log('Usando carrito activo existente:', { cartId: cart.cartId, _id: cart._id });
        }

        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(p => p.product.toString() === pid);
        
        if (existingProductIndex !== -1) {
            console.log('Producto existente, actualizando cantidad');
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            console.log('Agregando nuevo producto al carrito');
            cart.products.push({ 
                product: pid, 
                quantity: quantity 
            });
        }

        await cart.save();
        console.log('Carrito guardado exitosamente');
        
        // Poblar los productos antes de enviar la respuesta
        const updatedCart = await Cart.findOne({ cartId: cart.cartId })
            .populate({
                path: 'products.product',
                model: 'Product'
            });
        
        console.log('Carrito actualizado:', {
            cartId: updatedCart.cartId,
            productsCount: updatedCart.products.length,
            products: updatedCart.products.map(p => ({
                productId: p.product._id,
                title: p.product.title,
                quantity: p.quantity
            }))
        });

        res.json({ 
            status: 'success', 
            message: 'Producto agregado al carrito',
            payload: {
                cartId: updatedCart.cartId,
                products: updatedCart.products.map(item => ({
                    product: {
                        _id: item.product._id.toString(),
                        title: item.product.title,
                        description: item.product.description,
                        price: item.product.price,
                        thumbnail: item.product.thumbnail,
                        category: item.product.category,
                        stock: item.product.stock
                    },
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ 
            status: 'error', 
            error: 'Error al agregar el producto al carrito: ' + error.message 
        });
    }
});

// Delete product from cart
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await Cart.findOne({ cartId });
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();

        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Update cart with new products array
router.put('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const { products } = req.body;

        const cart = await Cart.findOne({ cartId });
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Cart not found' });
        }

        // Validate all products exist
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ 
                    status: 'error', 
                    error: `Product with ID ${item.product} not found` 
                });
            }
        }

        cart.products = products;
        await cart.save();
        
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Update product quantity in cart
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const { pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({ 
                status: 'error', 
                error: 'Quantity must be a positive number' 
            });
        }

        const cart = await Cart.findOne({ cartId });
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Cart not found' });
        }

        const productInCart = cart.products.find(p => p.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ 
                status: 'error', 
                error: 'Product not found in cart' 
            });
        }

        productInCart.quantity = quantity;
        await cart.save();
        
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Delete all products from cart
router.delete('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await Cart.findOne({ cartId });
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Cart not found' });
        }

        cart.products = [];
        await cart.save();
        
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Mark cart as completed
router.put('/:cid/complete', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await Cart.findOne({ cartId });
        
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
        }

        cart.completed = true;
        await cart.save();
        
        console.log('Carrito marcado como completado:', { cartId: cart.cartId });
        
        res.json({ 
            status: 'success', 
            message: 'Carrito completado exitosamente',
            payload: {
                cartId: cart.cartId,
                completed: cart.completed
            }
        });
    } catch (error) {
        console.error('Error al marcar carrito como completado:', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Finalizar compra
router.post('/:cid/purchase', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        console.log('Finalizando compra del carrito:', cartId);

        // Buscar el carrito actual
        const cart = await Cart.findOne({ cartId, completed: false })
            .populate('products.product');

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                error: 'Carrito no encontrado o ya completado'
            });
        }

        // Marcar el carrito actual como completado
        cart.completed = true;
        await cart.save();
        console.log('Carrito completado:', cartId);

        // Crear un nuevo carrito activo
        const newCart = new Cart({ completed: false });
        await newCart.save();
        console.log('Nuevo carrito activo creado:', newCart.cartId);

        // Actualizar el stock de los productos
        for (const item of cart.products) {
            const product = item.product;
            product.stock -= item.quantity;
            await product.save();
        }

        res.json({
            status: 'success',
            payload: {
                message: 'Compra finalizada exitosamente',
                completedCartId: cartId,
                newCartId: newCart.cartId
            }
        });
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

module.exports = router;
