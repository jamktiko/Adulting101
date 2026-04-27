const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Tämä linkittää budjetin testi-user-123:een
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: String,
  amount: Number,
  date: { type: Date, default: Date.now }
}, { collection: 'budgeting' });

module.exports = mongoose.model('Budget', BudgetSchema);