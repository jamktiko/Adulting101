const mongoose = require('mongoose');

const CleanItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true }
}, { 
  collection: 'cleanlist', // Varmistetaan että nimi on sama kuin kannassa
  versionKey: false 
});

module.exports = mongoose.model('CleanItem', CleanItemSchema);