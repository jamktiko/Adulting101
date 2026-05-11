// alkuperäinen
// const mongoose = require('mongoose');

// const BudgetSchema = new mongoose.Schema({
//   user_id: { type: String, required: true }, // Tämä linkittää budjetin testi-user-123:een
//   type: { type: String, enum: ['income', 'expense'], required: true },
//   category: String,
//   amount: Number,
//   date: { type: Date, default: Date.now }
// }, { collection: 'budgeting' });

// module.exports = mongoose.model('Budget', BudgetSchema);

const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // Esim. "2026-05"
    monthlyBudgetLimit: { type: Number, default: 0, min: 0, max: 1000000 }, // Kokonaisbudjetin raja

    entries: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        category: {
          type: String,
          required: true,
          minlength: 1,
          maxlength: 50,
        },
        amount: {
          type: Number,
          required: true,
          min: 0.01,
          max: 999999.99,
        },
        description: {
          type: String,
          maxlength: 250,
        },
        date: { type: Date, default: Date.now, required: true },
      },
    ],
  },
  { collection: 'budgeting' },
);

module.exports = mongoose.model('Budget', BudgetSchema);
