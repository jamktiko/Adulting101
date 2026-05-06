const mongoose = require('mongoose');

const MoveItemSchema = new mongoose.Schema({
  // Määritellään _id merkkijonona, jotta se vastaa "item_001" muotoa
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, { 
  // Pakotetaan Mongoose käyttämään kokoelmaa 'moveitems' 
  // ja estetään versionKey (__v) luominen
  collection: 'moveitems',
  versionKey: false 
});

module.exports = mongoose.model('MoveItem', MoveItemSchema);