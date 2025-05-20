/*const express = require('express');
const app = express();
const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
*/

const express = require("express");
const { Server } = require("socket.io");
const handlebars = require("express-handlebars");
const path = require("path");
const ProductManager = require("./src/managers/productManager"); // ajustá el path si está en otra carpeta
const productManager = new ProductManager("./src/data/products.json");



const app = express();
const httpServer = app.listen(3030, () => console.log("Servidor en puerto 3030"));
const io = new Server(httpServer);

// Static y json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src", "views"));

// Routers
const viewsRouter = require("./src/routes/view.routes");
app.use("/", viewsRouter);

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

// Socket.io
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado");

  socket.on("nuevoProducto", async (prod) => {
    await productManager.addProduct(prod);
    const productos = await productManager.getProducts();
    io.emit("productosActualizados", productos);
  });

  socket.on("eliminarProducto", async (pid) => {
    await productManager.deleteProduct(pid);
    const productos = await productManager.getProducts();
    io.emit("productosActualizados", productos);
  });
});

// Exportar io si lo necesitas dentro de rutas POST (opcional)
module.exports = { io };
