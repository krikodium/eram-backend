// src/controllers/productController.js (VERSIÓN CON AMBAS CORRECCIONES)
const pool = require('../config/db');

// --- OBTENER TODOS LOS PRODUCTOS CON PAGINACIÓN --- (Sin cambios)
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
    res.json({ productos, currentPage: page, totalPages, totalProducts });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER DETALLE DE PRODUCTO --- (Sin cambios)
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

// --- PRODUCTOS POR SUBCATEGORÍAS (AHORA CORREGIDO) ---
// Esta función ahora busca productos directamente por 'categoria_id',
// ignorando las subcategorías. El nombre de la función se mantiene
// para no tener que cambiar el frontend por ahora.
const getProductosPorSubcategorias = async (req, res) => {
  const { categoria_id } = req.query;
  if (!categoria_id) {
    return res.status(400).json({ error: 'Falta el parámetro categoria_id' });
  }

  try {
    // 1. Obtener el nombre de la categoría principal para el título
    const categoriaQuery = 'SELECT nombre FROM categorias WHERE id = $1';
    const { rows: categoriaRows } = await pool.query(categoriaQuery, [categoria_id]);

    if (categoriaRows.length === 0) {
      return res.json([]); // Si la categoría no existe, no hay productos
    }
    const categoriaNombre = categoriaRows[0].nombre;

    // 2. Buscar todos los productos que pertenecen directamente a esa categoría
    const productosQuery = 'SELECT * FROM productos WHERE categoria_id = $1 ORDER BY nombre ASC';
    const { rows: productos } = await pool.query(productosQuery, [categoria_id]);

    // 3. Devolver los productos en un "bloque" para que el frontend los muestre
    // como antes, pero ahora agrupados por la categoría principal.
    res.json([{
        categoria_id: categoria_id,
        categoria_nombre: categoriaNombre,
        productos: productos
    }]);

  } catch (error) {
    console.error('Error en getProductosPorSubcategorias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// --- PRODUCTOS DESTACADOS (VERSIÓN HOTFIX TEMPORAL) ---
const getProductosDestacados = async (req, res) => {
  try {
    const queryProductos = `
      SELECT * FROM productos
      WHERE imagen_portada_url IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 12
    `;
    const { rows: productos } = await pool.query(queryProductos);
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