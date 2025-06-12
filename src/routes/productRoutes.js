// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator'); // <-- 1. Importar 'param'
const { getAllProducts, getProductById } = require('../controllers/productController');

// La ruta para obtener todos los productos no cambia
router.get('/', getAllProducts);

// --- RUTA MODIFICADA ---
// Ahora, antes de llamar a getProductById, le pedimos que valide el parámetro 'id'
router.get('/:id', 
    param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'), // <-- 2. Añadir la regla de validación
    getProductById
);

module.exports = router;