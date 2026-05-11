const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: String,
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
  // startDate: Date,
  // endDate: Date,
  description: String,
});

module.exports = mongoose.model('RecurringEntry', recurringSchema);
