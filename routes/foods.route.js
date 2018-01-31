const express = require('express');
const foodsController = require('../controllers/foods.controller');
const jwt = require('../helpers/jwt');

const router = express.Router();

router.use(jwt.checkAuth);

router.get('/', foodsController.getFoods);
router.get('/search', foodsController.searchAllFoods);

module.exports = router;
