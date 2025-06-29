// index.js (VERSIÓN CORREGIDA)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// --- CORRECCIÓN EN LAS RUTAS DE IMPORTACIÓN ---
// Ahora apuntan correctamente a la carpeta 'src' que está en el mismo nivel.
const productRoutes = require('./src/routes/productRoutes.js');
const categoryRoutes = require('./src/routes/categoryRoutes.js');

const app = express();
// Render asigna el puerto dinámicamente, por eso es crucial usar process.env.PORT
const PORT = process.env.PORT || 3001; 

// Middlewares de seguridad y configuración
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta de bienvenida para verificar que el servidor está online
app.get('/', (req, res) => {
  res.send('¡El servidor del backend de ERAM está funcionando correctamente!');
});

// --- REGISTRO DE LAS RUTAS DE LA API ---
// Esto no cambia, pero ahora las variables 'productRoutes' y 'categoryRoutes' sí contienen los archivos correctos.
app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});