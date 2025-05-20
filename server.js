const express = require("express");
const { Server } = require("socket.io");
const handlebars = require("express-handlebars");
const path = require("path");
const connectDB = require('./src/config/db.config');

const app = express();
const httpServer = app.listen(3030, () => console.log("Servidor iniciado en puerto 3030"));
const io = new Server(httpServer);

// Conexión a MongoDB
const mongoose = require('mongoose');
const uri = 'mongodb+srv://dbNano:Samba.0506@cluster0.vdboqay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine({
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
    helpers: {
        multiply: function(a, b) {
            return a * b;
        },
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(amount);
        },
        add: function(a, b) {
            return a + b;
        },
        subtract: function(a, b) {
            return a - b;
        },
        calculateTotal: function(products) {
            return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        }
    }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));

// Configuración de rutas
const viewsRouter = require("./src/routes/view.routes");
app.use("/", viewsRouter);

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configuración de Socket.io
io.on("connection", (socket) => {
  console.log("Nueva conexión establecida");

  socket.on("nuevoProducto", async (prod) => {
    try {
      const Product = require('./src/models/product.model');
      const newProduct = new Product(prod);
      await newProduct.save();
      const productos = await Product.find();
      io.emit("productosActualizados", productos);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

  socket.on("eliminarProducto", async (pid) => {
    try {
      const Product = require('./src/models/product.model');
      await Product.findByIdAndDelete(pid);
      const productos = await Product.find();
      io.emit("productosActualizados", productos);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});

module.exports = { io };
