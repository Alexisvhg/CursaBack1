const fs = require('fs');
const path = './data/carts.json';

class CartManager {
    constructor() {
        this.path = path;
    }

    async getCarts() {
        if (!fs.existsSync(this.path)) return [];
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async createCart() {
        const carts = await this.getCarts();
        const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
        carts.push(newCart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(cart => cart.id === id);
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) return null;

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity++;
        } else {
            carts[cartIndex].products.push({ product: productId, quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }
}

module.exports = CartManager;
