const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
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
  frequency: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
  description: {
    type: String,
    maxlength: 250,
  },
});

module.exports = mongoose.model('RecurringEntry', recurringSchema);
