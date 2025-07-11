// src/controllers/productController.js (VERSIÓN COMPLETA CON LOGS)
const pool = require('../config/db');

// Obtiene todos los productos con paginación (para la vista principal)
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const productsQuery = 'SELECT * FROM productos ORDER BY nombre ASC LIMIT $1 OFFSET $2';
    const { rows: productos } = await pool.query(productsQuery, [limit, offset]);

    const countQuery = 'SELECT COUNT(*) FROM productos';
    const { rows: countRows } = await pool.query(countQuery);
    const totalProducts = parseInt(countRows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

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

// Obtiene productos de una categoría específica con paginación y logs
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
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM productos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategoryPaginated,
  getProductById,
};