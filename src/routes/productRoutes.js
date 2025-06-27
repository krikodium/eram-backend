// src/routes/productRoutes.js (CORREGIDO)
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const {
  getProductosDestacados,
  getProductosPorSubcategorias,
  getProductById
} = require('../controllers/productController');

// Para la vista inicial del catálogo
router.get('/destacados', getProductosDestacados);

// Para cuando se filtra por categoría
router.get('/por-subcategorias', getProductosPorSubcategorias);

// Para el detalle de un producto
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  getProductById
);

module.exports = router;