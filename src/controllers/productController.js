// src/controllers/productController.js (VERSIÓN CON HOTFIX)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// --- OBTENER TODOS LOS PRODUCTOS CON PAGINACIÓN ---
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

// --- PRODUCTOS POR SUBCATEGORÍAS --- (Se mantiene por ahora)
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

    if (subcategorias.length === 0) {
      return res.json([]);
    }

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
    // Este error puede ocurrir en producción si la tabla 'subcategorias' no existe.
    // El hotfix en getProductosDestacados evita el crash inicial de la página.
    console.error('Error en getProductosPorSubcategorias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- PRODUCTOS DESTACADOS (VERSIÓN HOTFIX TEMPORAL) ---
// Esta versión no depende de subcategorías y funciona sin modificar la base de datos.
const getProductosDestacados = async (req, res) => {
  try {
    // 1. Obtenemos 12 productos aleatorios que tengan una imagen de portada.
    const queryProductos = `
      SELECT * FROM productos
      WHERE imagen_portada_url IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 12
    `;
    const { rows: productos } = await pool.query(queryProductos);

    // 2. Devolvemos los productos en el formato que el frontend espera.
    const resultados = [
      {
        categoria_id: 'destacados',
        categoria_nombre: 'Productos Destacados',
        productos: productos
      }
    ];

    res.json(resultados);
  } catch (error) {
    console.error("Error en productos destacados (hotfix):", error);
    res.status(500).json({ error: "Error al obtener productos destacados" });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  getProductosDestacados,
  getProductosPorSubcategorias,
};