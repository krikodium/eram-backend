// src/controllers/productController.js (CORREGIDO)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// --- NUEVA FUNCIÓN PARA OBTENER TODOS LOS PRODUCTOS CON PAGINACIÓN ---
const getAllProducts = async (req, res) => {
  try {
    // Obtenemos los parámetros de paginación de la URL (o usamos valores por defecto)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Consulta para obtener los productos de la página actual
    const productsQuery = 'SELECT * FROM productos ORDER BY nombre ASC LIMIT $1 OFFSET $2';
    const { rows: productos } = await pool.query(productsQuery, [limit, offset]);
    
    // Consulta para obtener el número total de productos (para calcular el total de páginas)
    const countQuery = 'SELECT COUNT(*) FROM productos';
    const { rows: countRows } = await pool.query(countQuery);
    const totalProducts = parseInt(countRows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    // Devolvemos los productos y la información de paginación
    res.json({
      productos,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getProductById = async (req, res) => {
  // ... (el resto de la función queda igual)
};

const getProductosDestacados = async (req, res) => {
  // ... (el resto de la función queda igual)
};

const getProductosPorSubcategorias = async (req, res) => {
  // ... (el resto de la función queda igual)
};

// --- AÑADIMOS LA NUEVA FUNCIÓN A LAS EXPORTACIONES ---
module.exports = {
  getAllProducts, // <-- Exportar la nueva función
  getProductById,
  getProductosDestacados,
  getProductosPorSubcategorias,
};