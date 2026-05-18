// routes/topics.routes.js
//
// Reititys: /api/topics/:category

const express = require('express');
const router = express.Router();

const topicsController = require('../controllers/topics.controller');

router.get('/:category', topicsController.getByCategory);

module.exports = router;
