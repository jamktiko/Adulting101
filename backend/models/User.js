const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Määritellään, että _id on merkkijono (String), jotta voimme käyttää omia ID-arvoja (esim. Cognitosta)
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // 1. SIIVOUSLISTA (Pysyy ennallaan, jos haluatte pitää sen käyttäjäkohtaisena)
    cleaning_checklist: [
        {
            task: { type: String },
            done: { type: Boolean, default: false }
        }
    ],

    // 2. MUUTTOLISTA (Päivitetty uusi malli)
    // Tallennetaan vain taulukko MoveItem-dokumenttien _id-arvoja (esim. ["item_001", "item_002"])
    purchased_items: {
        type: [String],
        default: []
    },
    
    // Viikoittainen nollaus (siivouslistaa varten, jos otatte sen myöhemmin käyttöön)
    last_reset: { type: Date, default: Date.now },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', userSchema);