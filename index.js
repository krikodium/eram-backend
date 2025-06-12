// src/index.js (Versión Corregida y Completa)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importamos nuestras rutas
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- RUTA DE BIENVENIDA (LA QUE FALTABA) ---
// Esto le dice al servidor qué hacer cuando alguien visita la raíz '/'
app.get('/', (req, res) => {
res.send('¡El servidor del backend de ERAM está funcionando correctamente\!');
});

// Usar las rutas de la API
app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
console.log(`Servidor escuchando en el puerto ${PORT}`);
});