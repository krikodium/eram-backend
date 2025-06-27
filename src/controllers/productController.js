// src/controllers/productController.js
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Obtener todos los productos (con o sin filtro de categoría)
const getAllProducts = async (req, res) => {
  const { categoria } = req.query;

  try {
    if (!categoria) {
      const queryText = 'SELECT * FROM productos ORDER BY nombre ASC';
      const { rows } = await pool.query(queryText);
      return res.json(rows);
    }

    const categoryQuery = `
      SELECT id FROM categorias 
      WHERE id = $1 OR categoria_padre_id = $1
    `;
    const categoryResult = await pool.query(categoryQuery, [categoria]);

    if (categoryResult.rowCount === 0) return res.json([]);

    const categoryIds = categoryResult.rows.map(row => row.id);

    const productQuery = `
      SELECT * FROM productos 
      WHERE categoria_id = ANY($1::bigint[]) 
      ORDER BY nombre ASC
    `;
    const { rows } = await pool.query(productQuery, [categoryIds]);
    return res.json(rows);
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { rows, rowCount } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error en getProductById con id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Productos destacados de inicio (5 categorías, 1 producto c/u)
const getProductosInicio = async (req, res) => {
  try {
    const categoriasQuery = `
      SELECT DISTINCT categoria_id 
      FROM productos 
      ORDER BY RANDOM() 
      LIMIT 5
    `;
    const categoriasResult = await pool.query(categoriasQuery);
    const categorias = categoriasResult.rows.map(row => row.categoria_id);

    const productos = [];
    for (const categoriaId of categorias) {
      const productoQuery = `
        SELECT * FROM productos 
        WHERE categoria_id = $1 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      const productoResult = await pool.query(productoQuery, [categoriaId]);
      if (productoResult.rows.length > 0) {
        productos.push(productoResult.rows[0]);
      }
    }

    return res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos de inicio:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Productos destacados: 5 categorías con 15 productos cada una
const getProductosDestacados = async (req, res) => {
  try {
    const categoriasQuery = `
      SELECT id, nombre FROM categorias 
      WHERE categoria_padre_id IS NULL 
      ORDER BY RANDOM() 
      LIMIT 5
    `;
    const categoriasResult = await pool.query(categoriasQuery);

    const resultado = [];
    for (const categoria of categoriasResult.rows) {
      const productosQuery = `
        SELECT * FROM productos 
        WHERE categoria_id = $1 
        ORDER BY RANDOM() 
        LIMIT 15
      `;
      const productosResult = await pool.query(productosQuery, [categoria.id]);
      resultado.push({
        categoria_id: categoria.id,
        categoria_nombre: categoria.nombre,
        productos: productosResult.rows
      });
    }

    return res.json(resultado);
  } catch (error) {
    console.error("Error en getProductosDestacados:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔥 Nuevo: productos agrupados por subcategoría para una categoría padre
const getProductosPorSubcategorias = async (req, res) => {
  const { categoria_id } = req.query;

  try {
    // Buscar subcategorías de la categoría padre
    const subcategoriasQuery = `
      SELECT id, nombre FROM categorias 
      WHERE categoria_padre_id = $1
    `;
    const subcategoriasResult = await pool.query(subcategoriasQuery, [categoria_id]);

    if (subcategoriasResult.rows.length === 0) {
      // Si no tiene subcategorías, devolver productos de esa categoría
      const productosQuery = `
        SELECT * FROM productos 
        WHERE categoria_id = $1 
        ORDER BY nombre ASC
      `;
      const productosResult = await pool.query(productosQuery, [categoria_id]);
      return res.json([{
        subcategoria_id: categoria_id,
        subcategoria_nombre: "Productos",
        productos: productosResult.rows
      }]);
    }

    const resultado = [];

    for (const sub of subcategoriasResult.rows) {
      const productosQuery = `
        SELECT * FROM productos 
        WHERE categoria_id = $1 
        ORDER BY nombre ASC 
        LIMIT 15
      `;
      const productosResult = await pool.query(productosQuery, [sub.id]);
      resultado.push({
        subcategoria_id: sub.id,
        subcategoria_nombre: sub.nombre,
        productos: productosResult.rows
      });
    }

    return res.json(resultado);
  } catch (error) {
    console.error("Error en getProductosPorSubcategorias:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductosInicio,
  getProductosDestacados,
  getProductosPorSubcategorias,
};
