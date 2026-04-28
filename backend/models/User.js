const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Määritellään, että _id on merkkijono (String), jotta voimme käyttää omia ID-arvoja
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // Lisätään checklistat Schemaan
    cleaning_checklist: [
        {
            task: { type: String },
            done: { type: Boolean, default: false }
        }
    ],
    move_checklist: [
        {
            task: { type: String },
            purchased: { type: Boolean, default: false }
        }
    ],
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', userSchema);