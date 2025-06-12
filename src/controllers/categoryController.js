// src/controllers/categoryController.js
const pool = require('../config/db');

const getAllCategories = async (req, res) => {
    try {
        // Obtenemos solo las categorías principales y sus hijas directas
        const query = `
            SELECT * FROM categorias 
            ORDER BY categoria_padre_id ASC NULLS FIRST, nombre ASC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error en getAllCategories:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllCategories,
};