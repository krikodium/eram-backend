const pool = require('../config/db');

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// NUEVO: Obtener 5 categorías aleatorias con hasta 15 productos cada una
const getCategoriasDestacadas = async (req, res) => {
  try {
    const categoriasQuery = `
      SELECT * FROM categorias
      ORDER BY RANDOM()
      LIMIT 5
    `;
    const { rows: categorias } = await pool.query(categoriasQuery);

    const resultados = [];

    for (const categoria of categorias) {
      const productosQuery = `
        SELECT * FROM productos
        WHERE categoria_id = $1
        ORDER BY RANDOM()
        LIMIT 15
      `;
      const { rows: productos } = await pool.query(productosQuery, [categoria.id]);

      resultados.push({
        categoria,
        productos,
      });
    }

    return res.json(resultados);
  } catch (error) {
    console.error("Error en getCategoriasDestacadas:", error);
    return res.status(500).json({ error: "Error al obtener categorías destacadas" });
  }
};

module.exports = {
  getAllCategories,
  getCategoriasDestacadas
};
