const fs = require('fs');
const path = './data/products.json';

class ProductManager {
    constructor() {
        this.path = path;
    }

    async getProducts() {
        if (!fs.existsSync(this.path)) return [];
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(prod => prod.id === id);
    }

    async addProduct(product) {
        const products = await this.getProducts();
        product.id = products.length ? products[products.length - 1].id + 1 : 1;
        products.push(product);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return product;
    }

    async updateProduct(id, updatedFields) {
        let products = await this.getProducts();
        products = products.map(prod => (prod.id === id ? { ...prod, ...updatedFields } : prod));
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filteredProducts = products.filter(prod => prod.id !== id);
        await fs.promises.writeFile(this.path, JSON.stringify(filteredProducts, null, 2));
    }
}

module.exports = ProductManager;
