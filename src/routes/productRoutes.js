// src/routes/productRoutes.js (VERSIÓN FINAL CORREGIDA)
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

// Importamos solo las funciones que existen y están exportadas
const {
  getProductosDestacados,
  getProductosPorSubcategorias,
  getProductById
} = require('../controllers/productController');

// Ruta para la vista inicial del catálogo (sin filtros)
router.get('/destacados', getProductosDestacados);

// Ruta para cuando se selecciona una categoría (con filtro)
router.get('/por-subcategorias', getProductosPorSubcategorias);

// Ruta para ver el detalle de un solo producto
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  getProductById
);

module.exports = router;