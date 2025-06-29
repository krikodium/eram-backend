// src/controllers/productController.js (CORREGIDO)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// --- NUEVA FUNCIÓN PARA OBTENER TODOS LOS PRODUCTOS CON PAGINACIÓN ---
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

const getProductosDestacados = async (req, res) => {
  try {
    const query = `
      SELECT * FROM productos
      ORDER BY RANDOM()
      LIMIT 15
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error en getProductosDestacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProductosPorSubcategorias = async (req, res) => {
  const { categoria_id } = req.query;

  if (!categoria_id) {
    return res.status(400).json({ error: 'Falta el parámetro categoria_id' });
  }

  try {
    const subcategoriasQuery = `
      SELECT id AS subcategoria_id, nombre AS subcategoria_nombre
      FROM subcategorias
      WHERE categoria_id = $1
    `;
    const { rows: subcategorias } = await pool.query(subcategoriasQuery, [categoria_id]);

    const bloques = [];

    for (const subcategoria of subcategorias) {
      const productosQuery = `
        SELECT *
        FROM productos
        WHERE subcategoria_id = $1
        ORDER BY nombre ASC
      `;
      const { rows: productos } = await pool.query(productosQuery, [subcategoria.subcategoria_id]);

      bloques.push({
        subcategoria_id: subcategoria.subcategoria_id,
        subcategoria_nombre: subcategoria.subcategoria_nombre,
        productos,
      });
    }

    res.json(bloques);
  } catch (error) {
    console.error('Error en getProductosPorSubcategorias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- EXPORTACIÓN DE TODAS LAS FUNCIONES ---
module.exports = {
  getAllProducts,
  getProductById,
  getProductosDestacados,
  getProductosPorSubcategorias,
};
