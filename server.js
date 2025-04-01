const express = require('express');
const app = express();
const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = 3030;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
