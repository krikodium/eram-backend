// src/controllers/productController.js (CORREGIDO)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

const getProductById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { rows, rowCount } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProductosDestacados = async (req, res) => {
  try {
    const categoriasQuery = `
      SELECT id, nombre as categoria_nombre FROM categorias 
      WHERE categoria_padre_id IS NULL ORDER BY RANDOM() LIMIT 5
    `;
    const categoriasResult = await pool.query(categoriasQuery);
    
    const resultadoFinal = [];
    for (const categoria of categoriasResult.rows) {
      const subCategoriasQuery = 'SELECT id FROM categorias WHERE categoria_padre_id = $1';
      const subCategoriasResult = await pool.query(subCategoriasQuery, [categoria.id]);
      let idsParaBuscar = subCategoriasResult.rows.map(sub => sub.id);
      
      if (idsParaBuscar.length === 0) idsParaBuscar.push(categoria.id);
      
      const productosQuery = `
        SELECT * FROM productos WHERE categoria_id = ANY($1::bigint[]) 
        ORDER BY RANDOM() LIMIT 15
      `;
      const productosResult = await pool.query(productosQuery, [idsParaBuscar]);

      if (productosResult.rows.length > 0) {
        resultadoFinal.push({
          categoria_id: categoria.id,
          categoria_nombre: categoria.categoria_nombre,
          productos: productosResult.rows
        });
      }
    }
    return res.json(resultadoFinal);
  } catch (error) {
    console.error("Error en getProductosDestacados:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getProductosPorSubcategorias = async (req, res) => {
  const { categoria_id } = req.query;
  if (!categoria_id) {
    return res.status(400).json({ error: "Se requiere un ID de categoría." });
  }
  try {
    const subcategoriasQuery = 'SELECT id, nombre FROM categorias WHERE categoria_padre_id = $1 ORDER BY nombre ASC';
    const subcategoriasResult = await pool.query(subcategoriasQuery, [categoria_id]);
    
    if (subcategoriasResult.rows.length === 0) {
        const productosQuery = 'SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC';
        const productosResult = await pool.query(productosQuery, [categoria_id]);
        return res.json([{ subcategoria_id: categoria_id, subcategoria_nombre: "General", productos: productosResult.rows }]);
    }

    const resultado = [];
    for (const sub of subcategoriasResult.rows) {
      const productosResult = await pool.query('SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC', [sub.id]);
      if (productosResult.rows.length > 0) {
          resultado.push({
            subcategoria_id: sub.id,
            subcategoria_nombre: sub.nombre,
            productos: productosResult.rows
          });
      }
    }
    return res.json(resultado);
  } catch (error) {
    console.error("Error en getProductosPorSubcategorias:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getProductById,
  getProductosDestacados,
  getProductosPorSubcategorias,
};