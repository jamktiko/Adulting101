const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Käytetään merkkijonoa, jotta ID voi olla esim. Cognitosta tuleva UUID
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // 1. MUUTTOLISTA (Pysyvät hankinnat)
    // Tallennetaan vain ID:t, esim. ["item_001", "item_005"]
    purchased_items: {
        type: [String],
        default: []
    },

    // 2. VIIKKOSIIVOUS (Viikoittain nollautuva)
    // Tallennetaan vain suoritettujen tehtävien ID:t, esim. ["task_001"]
    completed_cleaning_tasks: {
        type: [String],
        default: []
    },
    
    // Pidetään kirjaa, milloin lista on viimeksi nollattu
    last_reset: { 
        type: Date, 
        default: Date.now 
    },
    
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('users', userSchema);