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
    month: { type: String, required: true }, // Esim. "2026-05"
    monthlyBudgetLimit: { type: Number, default: 0 }, // Kokonaisbudjetin raja

    entries: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        category: String,
        amount: { type: Number, required: true },
        description: String,
        date: { type: Date, default: Date.now, required: true },
        // otetaan ehkä mukaan
        // isRecurring: { type: Boolean, default: false },
        // recurringId: String, // Linkittää toistuviin merkintöihin
      },
    ],
  },
  { collection: 'budgeting' },
);

module.exports = mongoose.model('Budget', BudgetSchema);
