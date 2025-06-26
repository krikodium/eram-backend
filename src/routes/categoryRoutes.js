const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoriasDestacadas
} = require('../controllers/categoryController');

router.get('/', getAllCategories);
router.get('/destacadas', getCategoriasDestacadas);

module.exports = router;
