// src/controllers/productController.js (CORREGIDO)
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Esta función obtiene productos por subcategorías y la usaremos como auxiliar
const getProductosAgrupados = async (categoriaIdPadre) => {
  const subcategoriasQuery = `
    SELECT id, nombre FROM categorias WHERE categoria_padre_id = $1 ORDER BY nombre ASC
  `;
  const subcategoriasResult = await pool.query(subcategoriasQuery, [categoriaIdPadre]);

  // Si no hay subcategorías, es posible que los productos estén en la categoría padre
  if (subcategoriasResult.rows.length === 0) {
    const productosQuery = `
      SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC LIMIT 15
    `;
    const productosResult = await pool.query(productosQuery, [categoriaIdPadre]);
    // Devolvemos en el formato esperado, como si fuera una subcategoría
    return [{
      subcategoria_id: categoriaIdPadre,
      subcategoria_nombre: "General",
      productos: productosResult.rows
    }];
  }

  const resultado = [];
  for (const sub of subcategoriasResult.rows) {
    const productosQuery = `
      SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC LIMIT 15
    `;
    const productosResult = await pool.query(productosQuery, [sub.id]);
    // Solo agregamos la subcategoría si tiene productos
    if (productosResult.rows.length > 0) {
      resultado.push({
        subcategoria_id: sub.id,
        subcategoria_nombre: sub.nombre,
        productos: productosResult.rows
      });
    }
  }
  return resultado;
};

// --- CONTROLADORES DE RUTAS ---

// ✅ CORREGIDO: Productos Destacados (para la vista inicial del catálogo)
const getProductosDestacados = async (req, res) => {
  try {
    const categoriasQuery = `
      SELECT id, nombre FROM categorias 
      WHERE categoria_padre_id IS NULL 
      ORDER BY RANDOM() 
      LIMIT 5
    `;
    const categoriasResult = await pool.query(categoriasQuery);
    const categoriasPadre = categoriasResult.rows;

    const resultadoFinal = [];
    for (const categoria of categoriasPadre) {
      // Reutilizamos la lógica de agrupación
      const bloquesDeProductos = await getProductosAgrupados(categoria.id);
      
      // Aplanamos los productos de todas las subcategorías en una sola lista para la categoría padre
      const todosLosProductos = bloquesDeProductos.flatMap(bloque => bloque.productos);

      if (todosLosProductos.length > 0) {
        resultadoFinal.push({
          categoria_id: categoria.id,
          categoria_nombre: categoria.nombre,
          productos: todosLosProductos
        });
      }
    }
    return res.json(resultadoFinal);
  } catch (error) {
    console.error("Error en getProductosDestacados:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ✅ CORREGIDO: Productos por Subcategorías (cuando se filtra)
const getProductosPorSubcategorias = async (req, res) => {
  const { categoria_id } = req.query;
  if (!categoria_id) {
    return res.status(400).json({ error: "Se requiere un ID de categoría." });
  }

  try {
    const resultado = await getProductosAgrupados(categoria_id);
    return res.json(resultado);
  } catch (error) {
    console.error("Error en getProductosPorSubcategorias:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un producto por ID (sin cambios)
const getProductById = async (req, res) => {
  // ... (tu código actual es correcto)
};

// Las demás funciones (getAllProducts, getProductosInicio) pueden permanecer si las usas en otro lado.

module.exports = {
  getProductById,
  getProductosDestacados,
  getProductosPorSubcategorias,
  // Asegúrate de exportar las funciones que realmente usas en productRoutes.js
};