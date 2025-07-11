// src/controllers/productController.js (VERSIÓN CON LOGS DE DIAGNÓSTICO)
const pool = require('../config/db');

// Obtiene todos los productos con paginación
const getAllProducts = async (req, res) => {
  // ... (esta función no cambia, la omito por brevedad)
};

// Obtiene productos de una categoría específica con paginación
const getProductsByCategoryPaginated = async (req, res) => {
  try {
    const { categoria_id, page = 1, limit = 15 } = req.query;
    
    // --- LOG DE DIAGNÓSTICO 1 ---
    console.log(`[DIAGNÓSTICO] Petición para categoria_id: ${categoria_id}, Página: ${page}`);

    if (!categoria_id) {
      return res.status(400).json({ error: 'Falta el parámetro categoria_id' });
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const productsQuery = 'SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC LIMIT $2 OFFSET $3';
    const { rows: productos } = await pool.query(productsQuery, [categoria_id, limit, offset]);

    // --- LOG DE DIAGNÓSTICO 2 ---
    console.log(`[DIAGNÓSTICO] Se encontraron ${productos.length} productos para la categoria_id: ${categoria_id}`);

    const countQuery = 'SELECT COUNT(*) FROM productos WHERE categoria_id = $1';
    const { rows: countRows } = await pool.query(countQuery, [categoria_id]);
    const totalProducts = parseInt(countRows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);
    
    const categoryNameQuery = 'SELECT nombre FROM categorias WHERE id = $1';
    const { rows: categoryRows } = await pool.query(categoryNameQuery, [categoria_id]);
    const categoriaNombre = categoryRows.length > 0 ? categoryRows[0].nombre : 'Categoría';

    res.json({
      categoriaNombre,
      productos,
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error('Error en getProductsByCategoryPaginated:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER DETALLE DE PRODUCTO ---
const getProductById = async (req, res) => {
  // ... (esta función no cambia)
};

module.exports = {
  getAllProducts,
  getProductsByCategoryPaginated,
  getProductById,
};