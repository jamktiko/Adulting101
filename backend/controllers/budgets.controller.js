// controllers/budgets.controller.js
//
// Budjetti-API:n liiketoimintalogiikka (MongoDB).
// Reittien validointi tehdään routes-tasolla validators-middlewareilla.

const Budget = require('../models/Budget');
const RecurringEntry = require('../models/RecurringEntry');
const { sanitize } = require('../utils/sanitizer');

async function getRecurring(req, res) {
  try {
    const recurring = await RecurringEntry.find({ user_id: req.params.userId });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBudget(req, res) {
  try {
    const budget = await Budget.findOne({
      user_id: req.params.userId,
      month: req.params.month,
    });

    res.json(budget || { entries: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function setLimit(req, res) {
  try {
    const { monthlyBudgetLimit } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { monthlyBudgetLimit },
      { upsert: true, returnDocument: 'after' },
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addRecurring(req, res) {
  try {
    const cleanData = {
      ...req.body,
      category: sanitize(req.body.category),
      description: sanitize(req.body.description),
    };

    const newRecurring = new RecurringEntry({
      ...cleanData,
      user_id: req.params.userId,
    });

    const saved = await newRecurring.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function addEntry(req, res) {
  try {
    const cleanData = {
      ...req.body,
      category: sanitize(req.body.category),
      description: sanitize(req.body.description),
    };

    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { $push: { entries: cleanData } },
      { upsert: true, returnDocument: 'after' },
    );

    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteRecurring(req, res) {
  try {
    await RecurringEntry.findByIdAndDelete(req.params.entryId);
    res.json({ message: 'Merkintä poistettu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteEntry(req, res) {
  try {
    const budget = await Budget.findOneAndUpdate(
      { user_id: req.params.userId, month: req.params.month },
      { $pull: { entries: { _id: req.params.entryId } } },
      { returnDocument: 'after' },
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getRecurring,
  getBudget,
  setLimit,
  addRecurring,
  addEntry,
  deleteRecurring,
  deleteEntry,
};
