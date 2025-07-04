// src/routes/productRoutes.js (CORREGIDO)
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const {
  getAllProducts, // <-- 1. Importar la nueva función
  getProductosDestacados,
  getProductosPorSubcategorias,
  getProductById
} = require('../controllers/productController');

// --- 2. AÑADIR LA NUEVA RUTA GENERAL ---
// Esta ruta se activará con GET /api/productos y usará la paginación
router.get('/', getAllProducts);



// Para cuando se filtra por categoría
router.get('/por-subcategorias', getProductosPorSubcategorias);

// Para el detalle de un producto
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  getProductById
);

//productos destacados
router.get('/destacados', getProductosDestacados);


module.exports = router;