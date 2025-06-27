// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const {
  getAllProducts,
  getProductById,
  getProductosInicio,
  getProductosDestacados,
  getProductosPorSubcategorias
} = require('../controllers/productController');

// Ruta para obtener productos aleatorios para el home (1 producto x 5 categorías)
router.get('/inicio', getProductosInicio);

// Ruta para obtener productos destacados (5 categorías con 15 productos c/u)
router.get('/destacados', getProductosDestacados);

// Ruta para obtener productos agrupados por subcategoría
router.get('/por-subcategorias', getProductosPorSubcategorias);

// Ruta para obtener todos los productos o filtrado por categoría
router.get('/', getAllProducts);

// Ruta para obtener producto por ID con validación
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  getProductById
);

module.exports = router;
