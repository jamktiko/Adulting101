const mongoose = require('mongoose');

// 1. Määritellään ensin muistilapun rakenne (sub-document)
const noteSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 2. Yhdistetään kaikki käyttäjän tiedot yhteen skeemaan
const userSchema = new mongoose.Schema({
    // Käytetään merkkijonoa (Cognito UUID)
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // Lista ostetuista tavaroista (ID:t)
    purchased_items: {
        type: [String],
        default: []
    },

    // Lista tehdyistä siivoustehtävistä (ID:t)
    completed_cleaning_tasks: {
        type: [String],
        default: []
    },

    // MUISTILAPUT: Tämä on nyt oikein sijoitettu osaksi käyttäjää
    notes: {
        type: [noteSchema],
        default: []
    },
    
    // Aikaleimat
    last_reset: { 
        type: Date, 
        default: Date.now 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { versionKey: false }); // Poistaa __v -kentän

// 3. Luodaan malli käyttäen yhdistettyä skeemaa
module.exports = mongoose.model('users', userSchema);