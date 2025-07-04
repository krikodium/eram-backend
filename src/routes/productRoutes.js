// src/routes/productRoutes.js (CORREGIDO)
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const {
  getAllProducts,
  getProductosDestacados,
  getProductosPorSubcategorias,
  getProductById
} = require('../controllers/productController');

// --- RUTA: Obtener todos los productos con paginación ---
router.get('/', getAllProducts);

// --- RUTA: Productos destacados (debe ir antes que /:id) ---
router.get('/destacados', getProductosDestacados);

// --- RUTA: Productos agrupados por subcategorías ---
router.get('/por-subcategorias', getProductosPorSubcategorias);

// --- RUTA: Detalle de producto individual ---
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  getProductById
);

module.exports = router;
