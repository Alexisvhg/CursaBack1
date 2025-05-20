const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    cartId: {
        type: Number,
        required: true,
        unique: true,
        default: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }]
}, { timestamps: true });

// Función para obtener el siguiente cartId
async function getNextCartId() {
    try {
        // Buscar el último carrito (completado o no) para mantener la secuencia
        const lastCart = await Cart.findOne().sort({ cartId: -1 });
        return lastCart ? lastCart.cartId + 1 : 1;
    } catch (error) {
        console.error('Error al obtener el siguiente cartId:', error);
        return 1;
    }
}

// Middleware para generar el ID secuencial
cartSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            this.cartId = await getNextCartId();
            console.log('Nuevo cartId generado:', this.cartId);
        } catch (error) {
            console.error('Error al generar cartId:', error);
            next(error);
        }
    }
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 