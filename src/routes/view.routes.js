const express = require("express");
const router = express.Router();
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

// Home page
router.get('/', async (req, res) => {
    res.redirect('/products');
});

// Products page with pagination
router.get('/products', async (req, res) => {
    try {
        console.log('Accediendo a la ruta /products');
        
        // Verificar la conexión a MongoDB
        if (!Product.db.readyState) {
            throw new Error('No hay conexión a la base de datos');
        }

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

        // Verificar que el carrito tenga un ID válido
        if (!cart || !cart.cartId) {
            throw new Error('Error: No se pudo obtener o crear un carrito válido');
        }

        console.log('ID del carrito activo:', cart.cartId);

        const { limit = 10, page = 1, sort, category, status } = req.query;
        console.log('Parámetros de consulta:', { limit, page, sort, category, status });
        
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
            lean: true
        };

        const query = {};
        if (category) query.category = category;
        if (status !== undefined) query.status = status === 'true';

        console.log('Ejecutando consulta de productos con query:', query);
        const products = await Product.find(query)
            .sort(options.sort)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .lean();

        console.log(`Productos encontrados: ${products.length}`);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / options.limit);

        const result = {
            status: 'success',
            payload: products.map(product => ({
                ...product,
                _id: product._id.toString()
            })),
            totalPages,
            prevPage: options.page > 1 ? options.page - 1 : null,
            nextPage: options.page < totalPages ? options.page + 1 : null,
            page: options.page,
            hasPrevPage: options.page > 1,
            hasNextPage: options.page < totalPages,
            prevLink: options.page > 1 ? `?page=${options.page - 1}&limit=${options.limit}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}${status !== undefined ? `&status=${status}` : ''}` : null,
            nextLink: options.page < totalPages ? `?page=${options.page + 1}&limit=${options.limit}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}${status !== undefined ? `&status=${status}` : ''}` : null,
            cartId: cart.cartId
        };

        console.log('Renderizando vista products con datos:', {
            totalProducts: result.payload.length,
            totalPages: result.totalPages,
            currentPage: result.page,
            cartId: result.cartId
        });

        res.render('products', result);
    } catch (error) {
        console.error('Error en la ruta /products:', error);
        res.status(500).render('error', { 
            error: `Error al cargar los productos: ${error.message}` 
        });
    }
});

// Add product form
router.get('/products/add', (req, res) => {
    res.render('add-product');
});

// Product detail page
router.get('/products/:pid', async (req, res) => {
    try {
        // Obtener el carrito actual
        let cart = await Cart.findOne().sort({ cartId: -1 });
        if (!cart) {
            cart = new Cart();
            await cart.save();
        }

        const product = await Product.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).render('error', { error: 'Producto no encontrado' });
        }

        res.render('product-detail', { 
            product: {
                ...product,
                _id: product._id.toString()
            },
            cartId: cart.cartId
        });
    } catch (error) {
        console.error('Error en la ruta /products/:pid:', error);
        res.status(500).render('error', { error: error.message });
    }
});

// Cart page
router.get('/carts/:cid', async (req, res) => {
    try {
        // Buscar el carrito activo más reciente
        const cart = await Cart.findOne({ completed: false }).sort({ cartId: -1 })
            .populate({
                path: 'products.product',
                model: 'Product'
            });

        if (!cart) {
            console.log('No hay carrito activo, creando uno nuevo...');
            // Crear un nuevo carrito si no hay ninguno activo
            const newCart = new Cart({ completed: false });
            await newCart.save();
            return res.redirect(`/carts/${newCart.cartId}`);
        }

        console.log('Carrito activo encontrado:', {
            cartId: cart.cartId,
            productsCount: cart.products.length,
            products: cart.products.map(p => ({
                productId: p.product._id,
                quantity: p.quantity
            }))
        });

        // Asegurarnos de que los productos estén correctamente poblados
        const populatedProducts = cart.products.map(item => ({
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
        }));

        res.render('cart', { 
            payload: {
                cartId: cart.cartId,
                products: populatedProducts
            }
        });
    } catch (error) {
        console.error('Error en la ruta /carts/:cid:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;