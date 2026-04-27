const mongoose = require('mongoose');

const EntertainmentSchema = new mongoose.Schema({
  // Linkitys käyttäjään (sama idea kuin budjetissa)
  user_id: { 
    type: String, 
    required: true 
  },
  
  // Mediatyyppi (rajoitettu valmiisiin vaihtoehtoihin)
  media_type: { 
    type: String, 
    enum: ['movie', 'game', 'book'], 
    required: true 
  },
  
  title: { 
    type: String, 
    required: true,
    trim: true // Poistaa ylimääräiset välilyönnit nimestä
  },
  
  // Tila: Onko kohde vasta haaveissa vai jo koettu?
  status: { 
    type: String, 
    enum: ['done', 'wishlist', 'in progress'], 
    default: 'wishlist' 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  // Varmistetaan, että Mongoose käyttää oikeaa kokoelmaa MongoDB:ssä
  collection: 'entertainment' 
});

module.exports = mongoose.model('Entertainment', EntertainmentSchema);