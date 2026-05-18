// controllers/topics.controller.js
//
// Hakee Arki-sivun (topics) sisällöt kategorian mukaan.

const Topic = require('../models/Topic');

async function getByCategory(req, res) {
  try {
    const { category } = req.params;
    const topics = await Topic.find({ category });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getByCategory,
};
