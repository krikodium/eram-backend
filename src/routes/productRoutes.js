// src/routes/productRoutes.js (VERSIÓN FINAL Y LIMPIA)
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const {
  getAllProducts,
  getProductsByCategoryPaginated, // <-- USAMOS LA NUEVA FUNCIÓN
  getProductById
} = require('../controllers/productController');

// RUTA: Obtener todos los productos con paginación
router.get('/', getAllProducts);

// RUTA: Obtener productos de una categoría con paginación
router.get('/por-categoria', getProductsByCategoryPaginated); // <-- NUEVA RUTA LIMPIA

// RUTA: Detalle de producto individual
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  getProductById
);

module.exports = router;