/*const mongoose = require('mongoose');
const Product = require('../src/models/product.model');

const categorias = ['electronics', 'books', 'clothing'];

function productoRandom() {
  return {
    title: "Producto " + Math.random().toString(36).substring(7),
    description: "Descripción aleatoria",
    price: Math.floor(Math.random() * 1000),
    thumbnail: "https://via.placeholder.com/150",
    code: Math.floor(Math.random() * 10000).toString(),
    stock: Math.floor(Math.random() * 50),
    category: categorias[Math.floor(Math.random() * categorias.length)],
    status: true
  };
}

async function cargarProductos() {
  try {
    // Conectar a MongoDB usando la misma URI que tu aplicación
    await mongoose.connect('mongodb+srv://dbNano:Samba.0506@cluster0.vdboqay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado a MongoDB');

    const productos = [];
    for (let i = 0; i < 100; i++) {
      productos.push(productoRandom());
    }

    // Insertar los productos usando el modelo de Mongoose
    await Product.insertMany(productos);
    console.log('100 productos insertados exitosamente');

    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ejecutar la función
cargarProductos();
/*