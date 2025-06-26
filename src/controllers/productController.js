// src/controllers/productController.js (Versión con Depuración)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Obtener todos los productos (con o sin filtro de categoría)
const getAllProducts = async (req, res) => {
  console.log("--- [1] Petición recibida en getAllProducts ---");
  const { categoria } = req.query;

  try {
    // SIN filtro de categoría
    if (!categoria) {
      console.log("--- [2] No se detectó filtro. Preparando consulta para todos los productos. ---");
      const queryText = 'SELECT * FROM productos ORDER BY nombre ASC';

      console.log("--- [3] Ejecutando consulta a la base de datos... ---");
      const { rows } = await pool.query(queryText);

      console.log(`--- [4] ¡Consulta exitosa! Se encontraron ${rows.length} productos. ---`);
      console.log("--- [5] Enviando respuesta al navegador... ---");

      return res.json(rows);
    }

    // CON filtro de categoría
    console.log(`--- [A] Se detectó filtro para categoría: ${categoria}. ---`);
    const categoryQuery = `
      SELECT id FROM categorias 
      WHERE id = $1 OR categoria_padre_id = $1
    `;

    console.log("--- [B] Buscando IDs de categoría y sub-categorías... ---");
    const categoryResult = await pool.query(categoryQuery, [categoria]);

    if (categoryResult.rowCount === 0) {
      console.log("--- La categoría solicitada no existe. Devolviendo lista vacía. ---");
      return res.json([]);
    }

    const categoryIds = categoryResult.rows.map(row => row.id);

    const productQuery = `
      SELECT * FROM productos 
      WHERE categoria_id = ANY($1::bigint[]) 
      ORDER BY nombre ASC
    `;

    console.log("--- [C] Ejecutando consulta de productos filtrada... ---");
    const { rows } = await pool.query(productQuery, [categoryIds]);

    console.log(`--- [D] ¡Consulta filtrada exitosa! Se encontraron ${rows.length} productos. ---`);
    return res.json(rows);

  } catch (error) {
    console.error("--- ¡ERROR! Ocurrió una excepción en getAllProducts:", error);
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

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(`Error en getProductById con id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// NUEVA FUNCIÓN: Productos destacados de inicio (5 aleatorios de 5 categorías)
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
module.exports = {
  getAllProducts,
  getProductById,
  getProductosInicio,
};

