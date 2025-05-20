const Product = require('../models/product.model');

class ProductManager {
    async getProducts(query = {}, options = {}) {
        const {
            limit = 10,
            page = 1,
            sort,
            category,
            status
        } = options;

        // Build query
        const filter = {};
        if (category) filter.category = category;
        if (status !== undefined) filter.status = status;

        // Build sort options
        const sortOptions = {};
        if (sort) {
            sortOptions.price = sort === 'asc' ? 1 : -1;
        }

        try {
            const products = await Product.find(filter)
                .sort(sortOptions)
                .limit(limit)
                .skip((page - 1) * limit);

            const totalProducts = await Product.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / limit);

            return {
                status: 'success',
                payload: products,
                totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                page: parseInt(page),
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevLink: page > 1 ? `?page=${page - 1}&limit=${limit}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}${status !== undefined ? `&status=${status}` : ''}` : null,
                nextLink: page < totalPages ? `?page=${page + 1}&limit=${limit}${sort ? `&sort=${sort}` : ''}${category ? `&category=${category}` : ''}${status !== undefined ? `&status=${status}` : ''}` : null
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id);
            return product;
        } catch (error) {
            throw new Error('Product not found');
        }
    }

    async addProduct(product) {
        try {
            const newProduct = new Product(product);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            const product = await Product.findByIdAndUpdate(
                id,
                updatedFields,
                { new: true }
            );
            return product;
        } catch (error) {
            throw new Error('Error updating product');
        }
    }

    async deleteProduct(id) {
        try {
            await Product.findByIdAndDelete(id);
            return true;
        } catch (error) {
            throw new Error('Error deleting product');
        }
    }
}

module.exports = ProductManager;
